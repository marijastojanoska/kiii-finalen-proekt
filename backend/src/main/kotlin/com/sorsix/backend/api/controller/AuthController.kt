package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.LoginRequest
import com.sorsix.backend.api.request.RegisterRequest
import com.sorsix.backend.config.JwtService
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.service.AuthService
import com.sorsix.backend.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val jwtService: JwtService,
    private val userService: UserService,
) {
    @PostMapping("/register")
    fun register(@RequestBody @Validated registerRequest: RegisterRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(authService.register(registerRequest))
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @PostMapping("/login")
    fun login(@RequestBody @Validated loginRequest: LoginRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(authService.login(loginRequest))
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @GetMapping("/logged-in-user")
    fun getLoggedInUser(@RequestHeader("Authorization") token: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(this.userService.getUserByUsername(jwtService.getUsernameByToken(token)))
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }


}