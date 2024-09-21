package com.sorsix.backend.domain.entity

import jakarta.persistence.*

@Entity
data class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val image: ByteArray,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val type: String
)
