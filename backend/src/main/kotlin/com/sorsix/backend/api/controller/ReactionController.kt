package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.ReactionRequest
import com.sorsix.backend.api.response.ReactionTypeResponse
import com.sorsix.backend.domain.enumeration.ReactionType
import com.sorsix.backend.service.ReactionService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/reactions")
class ReactionController(
    val reactionService: ReactionService
) {

    @GetMapping("/post/{postId}")
    fun getReactionsByPost(@PathVariable postId: Long): ResponseEntity<Any> {
        return try {
            val reactions = reactionService.getReactionsByPost(postId)
            ResponseEntity.ok(reactions)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping
    fun createReaction(
        @RequestBody @Validated reactionRequest: ReactionRequest,
    ): ResponseEntity<Any> {
        return try {
            val reaction = reactionService.createReaction(reactionRequest)
            ResponseEntity.ok(reaction)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/{reactionId}")
    fun deleteReaction(
        @PathVariable reactionId: Long,
        @RequestParam username: String,
    ): ResponseEntity<Any> {
        return try {
            reactionService.deleteReaction(reactionId, username)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/types")
    fun getReactionTypes(): List<ReactionTypeResponse> {
        return ReactionType.entries.map {
            ReactionTypeResponse(it.toString(), it.emoji)
        }
    }

    @GetMapping("/post/{postId}/type/{type}")
    fun getReactionsByTypeAndPost(
        @PathVariable postId: Long,
        @PathVariable type: String
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(reactionService.findAllByTypeAndPostId(type, postId))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

}
