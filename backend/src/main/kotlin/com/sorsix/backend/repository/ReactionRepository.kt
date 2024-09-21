package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Post
import com.sorsix.backend.domain.entity.Reaction
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.domain.enumeration.ReactionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ReactionRepository : JpaRepository<Reaction, Long> {
    fun findByUserAndPost(user: User, post: Post): Reaction?
    fun findAllByPost(post: Post): List<Reaction>
    fun deleteAllByPostId(postId: Long)
    fun findAllByTypeAndPostId(type: ReactionType, postId: Long): List<Reaction>
}
