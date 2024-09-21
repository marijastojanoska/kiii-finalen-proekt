package com.sorsix.backend.api.request

import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

data class UserProfileRequest(

    @get:NotBlank(message = "Username must not be blank")
    val username: String,

    val bio: String? = null,

    val profilePictureId: Long? = null,

    val dateOfBirth: LocalDate? = null,
)