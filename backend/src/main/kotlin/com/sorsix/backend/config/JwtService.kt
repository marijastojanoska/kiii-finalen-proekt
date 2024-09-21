package com.sorsix.backend.config

import com.sorsix.backend.repository.TokenRepository
import com.sorsix.backend.service.UserService
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.context.annotation.Lazy
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.security.Key
import java.util.*
import java.util.function.Function
import kotlin.collections.HashMap
import kotlin.reflect.jvm.internal.impl.load.kotlin.JvmType

@Service
class JwtService(
    private val SECRET_KEY: String = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    @Lazy private val userService: UserService,
    private val tokenRepository: TokenRepository,
) {
    fun extractUsername(token: String): String {
        return extractClaim(token, Claims::getSubject)
    }

    fun <T> extractClaim(token: String, claimsResolver: Function<Claims, T>): T {
        val claims = extractAllClaims(token)
        return claimsResolver.apply(claims)
    }

    fun extractAllClaims(token: String): Claims {
        return Jwts
            .parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .body
    }

    private fun getSignInKey(): Key {
        val keyBytes = Decoders.BASE64.decode(SECRET_KEY)
        return Keys.hmacShaKeyFor(keyBytes)
    }

    fun generateToken(
        extraClaims: Map<String, JvmType.Object>,
        userDetails: UserDetails
    ): String {
        return Jwts
            .builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.username)
            .setIssuedAt(Date())
            .setExpiration(Date(System.currentTimeMillis() + 1000 * 60 * 60 * 48))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact()
    }

    fun generateToken(userDetails: UserDetails): String {
        return generateToken(HashMap(), userDetails)
    }

    fun isTokenValid(
        token: String,
        userDetails: UserDetails
    ): Boolean {
        val username = extractUsername(token)
        return (username == userDetails.username) && !isTokenExpired(token)
    }

    fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }

    fun extractExpiration(token: String): Date {
        return extractClaim(token, Claims::getExpiration)
    }

    fun extractTokenFromHeader(header: String): String {
        if (header.startsWith("Bearer ")) {
            return header.substring(7).trim()
        }
        throw IllegalArgumentException("Invalid Authorization header format. Expected 'Bearer <token>'.")
    }

    fun isTokenGottenFromHeaderValid(username: String, token: String) {
        val userDetails: UserDetails = userService.getUserByUsername(username)
        val extractedTokenFromHeader = extractTokenFromHeader(token)
        if (!isTokenValid(extractedTokenFromHeader, userDetails)) {
            throw Exception("Invalid or expired token")
        }
    }


    fun getUsernameByToken(jwt: String): String {
        val token = extractTokenFromHeader(jwt)

        val user = tokenRepository.findByToken(token)?.user
            ?: throw Exception("Token not found or user not associated with token")

        if (!tokenRepository.existsByUserUsernameAndExpiredFalseAndRevokedFalse(user.username)) {
            throw Exception("Not a valid token")
        }

        return user.username
    }


}
