package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank

data class TagRequest(

    @get:NotBlank(message = "Name must not be blank")
    val name: String
)