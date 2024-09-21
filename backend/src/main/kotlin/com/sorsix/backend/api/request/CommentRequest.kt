package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class CommentRequest(

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    @get:NotNull(message = "Post id must not be null")
    val postId: Long,

    val parentId: Long? = null,

    @get:NotBlank(message = "Content must not be blank")
    val content: String,
)