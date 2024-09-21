package com.sorsix.backend.domain.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import com.sorsix.backend.domain.enumeration.Role
import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

@Entity
@Table(name = "app_user")
data class User(
    @Id
    @Column(nullable = false, unique = true)
    @get:JvmName("username")
    val username: String,

    @Column(nullable = false)
    @JsonIgnore
    @get:JvmName("password")
    val password: String,

    @Column(nullable = false, unique = true)
    val email: String,

    @Column(name = "first_name")
    val firstName: String,

    @Column(name = "last_name")
    val lastName: String,

    @Enumerated(EnumType.STRING)
    val role: Role = Role.USER,

    @Column(name = "account_deactivated",nullable = false)
    val accountDeactivated: Boolean = false,

    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL])
    val userProfile: UserProfile? = null,


    ) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableListOf(SimpleGrantedAuthority(role.name))
    }

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return username
    }

}