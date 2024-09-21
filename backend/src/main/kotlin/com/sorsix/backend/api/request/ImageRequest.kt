package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class ImageRequest(
    @get:NotNull(message = "Image byte array must not be null")
    val image: ByteArray,

    @get:NotBlank(message = "Image name must not be blank")
    val name: String,

    @get:NotBlank(message = "Image type must not be blank")
    val type: String
)
