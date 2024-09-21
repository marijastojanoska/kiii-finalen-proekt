package com.sorsix.backend.repository

import com.sorsix.backend.domain.entity.Comment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {
    fun findAllByPostId(postId: Long): List<Comment>
    fun findAllByPostId(postId: Long, pageable:Pageable): Page<Comment>
    fun findAllByParentId(parentId: Long, pageable: Pageable): Page<Comment>
    fun findAllByParentId(parentId: Long): List<Comment>
    fun deleteAllByParentId(parentId: Long)
    fun deleteAllByPostId(postId: Long)

    @Query("SELECT c.id FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL ORDER BY c.id DESC")
    fun findAllTopLevelCommentIdsByPostId(@Param("postId") postId: Long): List<Long>



}