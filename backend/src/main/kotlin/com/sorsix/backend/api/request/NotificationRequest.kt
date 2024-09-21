package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank

data class NotificationRequest(

    @get:NotBlank(message = "Notification must not be blank")
    val username: String,

    @get:NotBlank(message = "Message must not be blank")
    val message: String,
)
