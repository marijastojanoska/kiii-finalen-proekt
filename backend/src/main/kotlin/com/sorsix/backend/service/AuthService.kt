package com.sorsix.backend.service

import com.sorsix.backend.api.request.LoginRequest
import com.sorsix.backend.api.request.RegisterRequest
import com.sorsix.backend.api.response.AuthResponse
import com.sorsix.backend.config.JwtService
import com.sorsix.backend.domain.entity.Token
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.domain.entity.UserProfile
import com.sorsix.backend.domain.enumeration.TokenType
import com.sorsix.backend.repository.TokenRepository
import com.sorsix.backend.repository.UserProfileRepository
import com.sorsix.backend.repository.UserRepository
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.regex.Pattern

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val tokenRepository: TokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val authenticationManager: AuthenticationManager,
    private val userProfileRepository: UserProfileRepository,
) {
    fun register(registerRequest: RegisterRequest): AuthResponse {

        if (userRepository.existsByUsername(registerRequest.username)) {
            if (tokenRepository.existsByUserUsernameAndExpiredFalseAndRevokedFalse(registerRequest.username)) {
                throw Exception("User with username [${registerRequest.username}] already exists")
            } else {
                throw Exception("User with username [${registerRequest.username}] already exists but does not have an active token.")
            }
        }

        validateRegisterRequest(registerRequest)

        val user = User(
            username = registerRequest.username,
            firstName = registerRequest.firstName.capitalize(),
            lastName = registerRequest.lastName.capitalize(),
            email = registerRequest.email,
            password = passwordEncoder.encode(registerRequest.password),
        )

        userRepository.save(user)

        val userProfile = UserProfile(
            user = user
        )

        userProfileRepository.save(userProfile)

        val updatedUser = user.copy(userProfile = userProfile)

        val savedUser = userRepository.save(updatedUser)
        val jwtToken = jwtService.generateToken(updatedUser)
        val token = Token(
            user = savedUser,
            token = jwtToken,
            tokenType = TokenType.BEARER,
            expired = true,
            revoked = true
        )
        tokenRepository.save(token)
        return AuthResponse(token = jwtToken)
    }

    fun login(loginRequest: LoginRequest): AuthResponse {
        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                loginRequest.username,
                loginRequest.password
            )
        )

        val user = userRepository.findByUsername(loginRequest.username) ?: throw Exception("User not found")

        val updatedUser = if (user.accountDeactivated) {
            user.copy(accountDeactivated = false)
                .also { userRepository.save(it) }
        } else {
            user
        }

        val jwtToken = jwtService.generateToken(updatedUser)
        revokeAllUserTokens(updatedUser)
        val token = Token(
            user = updatedUser,
            token = jwtToken,
            tokenType = TokenType.BEARER,
            expired = false,
            revoked = false
        )
        tokenRepository.save(token)
        return AuthResponse(token = jwtToken)
    }

    fun revokeAllUserTokens(user: User) {
        val validUserTokens = tokenRepository.findAllValidTokensByUser(user.username)
        if (validUserTokens.isEmpty()) {
            return
        }
        validUserTokens.forEach { token ->
            token.revoked = true
            token.expired = true
        }
        tokenRepository.saveAll(validUserTokens)
    }

    fun validateEmail(email: String) {
        val emailPattern = Pattern.compile("^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\\.com\$")
        if (!emailPattern.matcher(email).matches()) {
            throw Exception("Email must be in the format: example@domain.com")
        }
    }

    fun validatePassword(password: String, confirmPassword: String) {
        val passwordPattern = Pattern.compile("^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$")
        if (!passwordPattern.matcher(password).matches()) {
            throw Exception("Password must contain at least one uppercase letter, one number, one special character, and be at least 6 characters long")
        }

        if (password != confirmPassword) {
            throw Exception("Passwords do not match")
        }
    }

    fun validateRegisterRequest(registerRequest: RegisterRequest) {
        validateEmail(registerRequest.email)
        validatePassword(registerRequest.password, registerRequest.confirmPassword)
    }


}