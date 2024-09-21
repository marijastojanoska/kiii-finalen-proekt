package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank


data class FollowRequest(

    @get:NotBlank(message = "Follower username must not be blank")
    val follower: String,

    @get:NotBlank(message = "Followed username must not be blank")
    val followed: String,
)