package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Notification
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findAllByUserUsernameOrderByCreatedAtDesc(username: String): List<Notification>
    fun findAllByUserUsernameOrderByCreatedAtDesc(username: String, pageable: Pageable): Page<Notification>
    fun deleteAllByUserUsername(username: String)
    fun findAllByUserUsername(username: String): List<Notification>
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.username = :username AND n.read = false")
    fun countByUserUsernameAndReadFalse(@Param("username") username: String?): Long
}
