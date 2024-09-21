package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserProfileRepository : JpaRepository<UserProfile, Long> {
    fun findByUserUsername(username: String): UserProfile?
    fun findByProfilePictureId(profilePictureId: Long): UserProfile?
}
