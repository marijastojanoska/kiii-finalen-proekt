package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Post
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.domain.entity.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param


@Repository
interface PostRepository : JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post p WHERE p.user.username = :username ORDER BY p.createdAt DESC")
    fun findAllByUserUsername(@Param("username") username: String, pageable: Pageable): Page<Post>
    fun findAllByUserUsername(username: String?): List<Post>

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t.name LIKE %:tagName%")
    fun findAllByTagName(@Param("tagName") tagName: String): List<Post>

    @Query("SELECT p FROM Post p WHERE p.user IN (SELECT f.followed FROM Follow f WHERE f.follower.username = :username) ORDER BY p.createdAt DESC")
    fun findAllByFollowing(@Param("username") username: String, pageable: Pageable): Page<Post>

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t.name LIKE %:tagName%")
    fun findAllByTagName(@Param("tagName") tagName: String, pageable: Pageable): Page<Post>

    @Query("SELECT p FROM Post p WHERE p.user.username = :username ORDER BY p.createdAt DESC")
    fun findLatestPostByUsername(@Param("username") username: String, pageable: Pageable): Page<Post>

    fun findByImageId(imageId: Long): Post?
    @Query("SELECT p.id FROM Post p")
    fun findAllPostIds(): List<Long>


}