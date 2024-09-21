package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.CommentRequest
import com.sorsix.backend.api.request.PageableByLongRequest
import com.sorsix.backend.service.CommentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/comments")
class CommentController(
    private val commentService: CommentService
) {

    @GetMapping("/{id}")
    fun getCommentById(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            val comment = commentService.getCommentById(id)
            ResponseEntity.ok(comment)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping
    fun createComment(
        @RequestBody @Validated commentRequest: CommentRequest
    ): ResponseEntity<Any> {
        return try {
            val comment = commentService.createComment(commentRequest)
            ResponseEntity.ok(comment)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PutMapping("/{id}")
    fun updateComment(
        @PathVariable id: Long,
        @RequestBody content: String,
    ): ResponseEntity<Any> {
        return try {
            val updatedComment = commentService.updateComment(id, content)
            ResponseEntity.ok(updatedComment)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteComment(
        @PathVariable id: Long,
    ): ResponseEntity<Any> {
        return try {
            commentService.deleteComment(id)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }


    @GetMapping("/post/{postId}")
    fun getCommentsByPost(@PathVariable postId:Long): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(commentService.getCommentsByPostId(postId))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/get-by-post/pageable")
    fun getCommentsByPost(@Validated @RequestBody pageableByLongRequest: PageableByLongRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(commentService.getCommentsByPostId(pageableByLongRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/get-by-parent/pageable")
    fun getCommentsByParentId(@Validated @RequestBody pageableByLongRequest: PageableByLongRequest): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(commentService.getCommentsByParentId(pageableByLongRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }
}
