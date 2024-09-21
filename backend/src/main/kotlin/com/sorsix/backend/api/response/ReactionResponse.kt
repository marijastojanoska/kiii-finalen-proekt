package com.sorsix.backend.api.response

import com.sorsix.backend.domain.entity.Reaction
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.domain.entity.Post
import com.sorsix.backend.domain.enumeration.ReactionType
import java.time.LocalDateTime

data class ReactionResponse(
    val id: Long,
    val user: User,
    val type: ReactionTypeResponse,
    val post: Post,
    val createdAt: LocalDateTime,
) {
    constructor(reaction: Reaction) : this(
        id = reaction.id,
        user = reaction.user,
        type = ReactionTypeResponse(reaction.type.name, reaction.type.emoji),
        post = reaction.post,
        createdAt = reaction.createdAt
    )
}
