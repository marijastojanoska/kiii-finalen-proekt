package com.sorsix.backend.domain.entity

import com.sorsix.backend.domain.enumeration.ReactionType
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class Reaction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,

    @Enumerated(EnumType.STRING)
    val type: ReactionType,

    @ManyToOne
    @JoinColumn(name = "post_id")
    val post: Post,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)