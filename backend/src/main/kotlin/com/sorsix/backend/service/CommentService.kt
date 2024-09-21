package com.sorsix.backend.service

import com.sorsix.backend.api.request.CommentRequest
import com.sorsix.backend.api.request.PageableByLongRequest
import com.sorsix.backend.domain.entity.Comment
import com.sorsix.backend.repository.CommentRepository
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CommentService(
    private val commentRepository: CommentRepository,
    @Lazy private val postService: PostService,
    private val userService: UserService,
    private val notificationService: NotificationService
) {

    fun getCommentById(commentId: Long): Comment =
        commentRepository.findById(commentId)
            .orElseThrow { Exception("Comment with id [$commentId] not found") }

    fun createComment(commentRequest: CommentRequest): Comment {
        val user = userService.getUserByUsername(commentRequest.username)
        val post = postService.getPostById(commentRequest.postId)
        val parentComment = commentRequest.parentId?.let {
            commentRepository.findById(it)
                .orElseThrow { Exception("Parent comment with id [${commentRequest.parentId}] not found") }
        }

        return Comment(
            user = user,
            post = post,
            content = commentRequest.content,
            parent = parentComment
        ).apply {
            commentRepository.save(this)
            parentComment?.let {
                notificationService.notifyUser(it.user, "${user.username} replied to your comment", user)
            } ?: run {
                notificationService.notifyUser(post.user, "${user.username} commented on your post", user)
            }
        }
    }

    fun updateComment(commentId: Long, content: String): Comment {
        val comment = getCommentById(commentId)
        val updatedComment = comment.copy(content = content)
        return commentRepository.save(updatedComment)
    }

    @Transactional
    fun deleteComment(commentId: Long) {
        deleteAllByParentId(commentId)
        commentRepository.deleteById(commentId)
    }

    fun getCommentsByPostId(postId: Long): List<Comment> {
        return commentRepository.findAllByPostId(postId)
    }


    fun getCommentsByPostId(pageableByLongRequest: PageableByLongRequest): Page<Comment> {
        return commentRepository.findAllByPostId(
            pageableByLongRequest.id,
            PageRequest.of(
                pageableByLongRequest.page,
                pageableByLongRequest.size
            )
        )
    }

    fun getCommentsByParentId(pageableByLongRequest: PageableByLongRequest): Page<Comment> {
        return commentRepository.findAllByParentId(
            pageableByLongRequest.id,
            PageRequest.of(
                pageableByLongRequest.page,
                pageableByLongRequest.size
            )
        )
    }

    fun deleteAllByParentId(parentId: Long) {
        return commentRepository.deleteAllByParentId(parentId)
    }

    fun deleteAllByPostId(postId: Long) {
        return commentRepository.deleteAllByPostId(postId)
    }

    fun findAllTopLevelCommentIdsByPostId(postId:Long): List<Long> {
        return commentRepository.findAllTopLevelCommentIdsByPostId(postId)
    }
}
