package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank


data class PostRequest(

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    @get:NotBlank(message = "Content must not be blank")
    val content: String,

    val imageId: Long? = null,
)