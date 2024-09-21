package com.sorsix.backend.api.request

import com.sorsix.backend.api.response.ReactionTypeResponse
import com.sorsix.backend.domain.enumeration.ReactionType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class ReactionRequest(

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    @get:NotNull(message = "Type must not be null")
    val type: String,

    @get:NotNull(message = "Post id must not be null")
    val postId: Long,
)