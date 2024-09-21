package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class PageableByLongRequest(

    @get:NotNull(message = "Id must not be null")
    val id: Long,

    @get:NotNull(message = "Page number must not be null")
    val page: Int,

    @get:NotNull(message = "Page size must not be null")
    val size: Int
)
