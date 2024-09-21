package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Notification
import com.sorsix.backend.domain.entity.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TagRepository : JpaRepository<Tag, Long> {
    fun existsByName(name: String): Boolean

    fun findByName(name: String): Tag?

    fun findAllByNameContaining(name: String, pageable: Pageable): Page<Tag>

}
