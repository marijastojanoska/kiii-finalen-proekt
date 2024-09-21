package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, String> {
    fun findByUsername(username: String): User?
    fun findAllByUsernameContaining(username: String): List<User>
    fun findAllByUsernameContaining(username: String, pageable:Pageable): Page<User>
    fun existsByUsername(username: String): Boolean


}