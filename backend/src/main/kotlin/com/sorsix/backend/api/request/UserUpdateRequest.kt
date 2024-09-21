package com.sorsix.backend.api.request

data class UserUpdateRequest(

    val username: String? = null,

    val oldPassword: String? = null,

    val password: String? = null,

    val confirmPassword: String? = null,

    val email: String? = null,

    val firstName: String? = null,

    val lastName: String? = null,
)