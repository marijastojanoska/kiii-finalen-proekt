package com.sorsix.backend.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class Follow(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    val follower: User,

    @ManyToOne
    @JoinColumn(name = "followed_id", nullable = false)
    val followed: User,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)