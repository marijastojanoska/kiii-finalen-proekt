package com.sorsix.backend.domain.entity

import com.sorsix.backend.domain.enumeration.TokenType
import jakarta.persistence.Entity
import jakarta.persistence.*

@Entity
data class Token(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val token: String,

    @Enumerated(EnumType.STRING)
    val tokenType: TokenType,

    var expired: Boolean,

    var revoked: Boolean,

    @ManyToOne
    @JoinColumn(name = "username")
    val user: User

)