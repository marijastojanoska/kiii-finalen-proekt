package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank

data class RegisterRequest(

    @get:NotBlank(message = "First name must not be blank")
    val firstName: String,

    @get:NotBlank(message = "Last name must not be blank")
    val lastName: String,

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    @get:NotBlank(message = "Email must not be blank")
    val email: String,

    @get:NotBlank(message = "Password must not be blank")
    val password: String,

    @get:NotBlank(message = "Confirm password must not be blank")
    val confirmPassword: String,

    )