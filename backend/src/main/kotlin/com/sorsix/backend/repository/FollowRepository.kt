package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Follow
import com.sorsix.backend.domain.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface FollowRepository : JpaRepository<Follow, Long> {
    fun findAllByFollowerOrderByCreatedAtDesc(user: User): List<Follow>
    fun findAllByFollowedOrderByCreatedAtDesc(user: User): List<Follow>

    fun findByFollowerAndFollowed(follower: User, followed: User): Follow?
    fun existsByFollowerAndFollowed(follower: User, followed: User): Boolean

    fun countByFollowed(user: User): Long
    fun countByFollower(user: User): Long

    @Query("SELECT f FROM Follow f WHERE f.followed = :user ORDER BY f.createdAt DESC")
    fun findLastNFollowers(@Param("user") user: User, pageable: Pageable): Page<Follow>

    @Query("SELECT f FROM Follow f WHERE f.follower = :user ORDER BY f.createdAt DESC")
    fun findLastNFollowing(@Param("user") user: User, pageable: Pageable): Page<Follow>

    @Query("SELECT u FROM User u WHERE u != :user AND u NOT IN (SELECT f.followed FROM Follow f WHERE f.follower = :user)")
    fun findUsersNotFollowedBy(@Param("user") user: User): List<User>

    @Query("SELECT f.followed FROM Follow f WHERE f.follower = :user")
    fun findUsersFollowedBy(@Param("user") user: User): List<User>



}
