package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank

data class LoginRequest(

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    @get:NotBlank(message = "Password must not be blank")
    val password: String
)
