package com.sorsix.backend.api.response

import com.sorsix.backend.domain.enumeration.ReactionType

data class ReactionTypeResponse(
    val type: String,
    val emoji: String
)
