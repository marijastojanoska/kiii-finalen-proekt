package com.sorsix.backend.service

import com.sorsix.backend.api.request.LoginRequest
import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.api.request.UserUpdateRequest
import com.sorsix.backend.config.JwtService
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.repository.UserRepository
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    @Lazy private val jwtService: JwtService,
    private val authService: AuthService,
) {

    fun getUserByUsername(username: String): User {
        return userRepository.findByUsername(username)
            ?: throw Exception("User with username [$username] not found")
    }

    fun searchUsersByUsername(username: String): List<User> {
        return userRepository.findAllByUsernameContaining(username)
            .takeIf { it.isNotEmpty() }
            ?: throw Exception("Users with username [$username] not found")
    }

    fun searchUsersByUsername(pageableByStringRequest: PageableByStringRequest): Page<User> {
        return userRepository.findAllByUsernameContaining(
            pageableByStringRequest.word,
            PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)
        )
    }

    fun deactivateAccount(loginRequest: LoginRequest){
        val user = userRepository.findByUsername(loginRequest.username)
            ?: throw Exception("User with [${loginRequest.username}] not found")

        if (!passwordEncoder.matches(loginRequest.password, user.password)) {
            throw Exception("Invalid password")
        }

        val updatedUser = user.copy(accountDeactivated = true)
        authService.revokeAllUserTokens(updatedUser)

        userRepository.save(updatedUser)
    }

    fun updateUser(username: String, updateRequest: UserUpdateRequest): User {
        val user = getUserByUsername(username)
        val newPassword = updateRequest.password
        val oldPassword = updateRequest.oldPassword
        val confirmPassword = updateRequest.confirmPassword

        if (oldPassword != null && !passwordEncoder.matches(oldPassword, user.password)) {
            throw Exception("Old password is incorrect")
        }

        if ((newPassword == null && confirmPassword != null) || (confirmPassword == null && newPassword != null)) {
            throw Exception("Both password and confirm password must be provided")
        } else if (newPassword != null && confirmPassword != null) {
            authService.validatePassword(newPassword, confirmPassword)
        }

        val updatedUser = user.copy(
            password = newPassword?.let { passwordEncoder.encode(it) } ?: user.password,
            email = updateRequest.email ?: user.email,
            firstName = updateRequest.firstName ?: user.firstName.capitalize(),
            lastName = updateRequest.lastName ?: user.lastName.capitalize()
        )
        return userRepository.save(updatedUser)
    }
}