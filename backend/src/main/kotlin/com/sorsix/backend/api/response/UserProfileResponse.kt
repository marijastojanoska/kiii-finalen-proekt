package com.sorsix.backend.api.response

import com.sorsix.backend.domain.entity.Image
import com.sorsix.backend.domain.entity.User
import java.time.LocalDate
import java.time.LocalDateTime

data class UserProfileResponse(

    val user: User,

    val bio: String?,

    val profilePicture: Image?,

    val dateOfBirth: LocalDate?,

    val createdAt: LocalDateTime,
)