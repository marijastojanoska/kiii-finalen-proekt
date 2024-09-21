package com.sorsix.backend.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class Comment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,

    @ManyToOne
    @JoinColumn(name = "post_id")
    val post: Post,

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    val parent: Comment? = null,

    val content: String,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now()
)