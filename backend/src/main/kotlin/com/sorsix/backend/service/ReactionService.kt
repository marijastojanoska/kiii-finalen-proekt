package com.sorsix.backend.service

import com.sorsix.backend.api.request.ReactionRequest
import com.sorsix.backend.api.response.ReactionResponse
import com.sorsix.backend.domain.entity.Post
import com.sorsix.backend.domain.entity.Reaction
import com.sorsix.backend.domain.enumeration.ReactionType
import com.sorsix.backend.repository.ReactionRepository
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class ReactionService(
    private val reactionRepository: ReactionRepository,
    @Lazy private val postService: PostService,
    private val userService: UserService,
    private val notificationService: NotificationService
) {
    fun createReaction(reactionRequest: ReactionRequest): Reaction {
        val user = userService.getUserByUsername(reactionRequest.username)
        val post = postService.getPostById(reactionRequest.postId)

        val existingReaction = reactionRepository.findByUserAndPost(user, post)
        return existingReaction?.let {
            val updatedReaction = it.copy(type = ReactionType.valueOf(reactionRequest.type))
            reactionRepository.save(updatedReaction)
        } ?: reactionRepository.save(
            Reaction(
                user = user,
                post = post,
                type = ReactionType.valueOf(reactionRequest.type)
            )
        ).also {
            notificationService.notifyUser(post.user, "${user.username} reacted on your post", user)
        }
    }

    fun deleteReaction(reactionId: Long, username: String) {
        val reaction = reactionRepository.findById(reactionId)
            .orElseThrow { Exception("Reaction with id [$reactionId] not found") }

        if (reaction.user.username != username) {
            throw Exception("You are not allowed to delete this reaction.")
        }

        reactionRepository.delete(reaction)
    }

    fun deleteAllByPostId(postId: Long) {
        reactionRepository.deleteAllByPostId(postId)
    }

    fun getReactionsByPost(postId: Long): List<ReactionResponse> {
        val post: Post = postService.getPostById(postId)
        return reactionRepository.findAllByPost(post).map { reaction -> ReactionResponse(reaction) }
    }

    fun findAllByTypeAndPostId(type: String, postId: Long): List<Reaction> {
        val typeObj = ReactionType.valueOf(type)
        return reactionRepository.findAllByTypeAndPostId(typeObj, postId)
    }
}