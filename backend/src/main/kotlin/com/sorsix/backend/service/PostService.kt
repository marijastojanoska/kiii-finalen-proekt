package com.sorsix.backend.service

import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.api.request.PostRequest
import com.sorsix.backend.api.request.TagRequest
import com.sorsix.backend.domain.entity.Image
import com.sorsix.backend.domain.entity.Post
import com.sorsix.backend.domain.entity.Tag
import com.sorsix.backend.repository.PostRepository
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class PostService(
    private val postRepository: PostRepository,
    private val userService: UserService,
    private val tagService: TagService,
    @Lazy private val imageService: ImageService,
    private val notificationService: NotificationService,
    private val followService: FollowService,
    @Lazy private val commentService: CommentService,
    @Lazy private val reactionService: ReactionService,
) {

    fun getPostById(postId: Long): Post = postRepository.findById(postId)
        .orElseThrow { (Exception("Post with id [$postId] not found")) }

    @Transactional
    fun createPost(postRequest: PostRequest): Post {
        val user = userService.getUserByUsername(postRequest.username)
        val tags = extractAndSaveTags(postRequest.content)
        val image = postRequest.imageId?.let { imageService.getImageById(it) }
        val post = Post(
            user = user,
            content = postRequest.content,
            image = image,
            createdAt = LocalDateTime.now(),
            tags = tags
        )
        return postRepository.save(post)
            .also {
                notificationService.notifyFollowers(user, "${user.username} posted something")
            }
    }

    fun updatePost(postId: Long, postRequest: PostRequest): Post {
        val existingPost = getPostById(postId)
        val tags = extractAndSaveTags(postRequest.content)
        val image = postRequest.imageId?.let { imageService.getImageById(it) }
        val updatedPost = existingPost.copy(
            content = postRequest.content,
            image = image ?: existingPost.image,
            tags = tags
        )
        return postRepository.save(updatedPost)
    }


    @Transactional
    fun deletePost(postId: Long) {
        commentService.deleteAllByPostId(postId)
        reactionService.deleteAllByPostId(postId)
        postRepository.deleteById(postId)
    }

    private fun extractAndSaveTags(content: String): Set<Tag> {
        val tagNames = Regex("#\\w+")
            .findAll(content)
            .map { it.value.substring(1).lowercase() }
            .toSet()
        return tagNames.map { tagName ->
            tagService.createTag(TagRequest(name = tagName))
        }.toSet()
    }

    fun searchPostsByTag(tagName: String): List<Post> {
        return postRepository.findAllByTagName(tagName.lowercase())
            .takeIf { it.isNotEmpty() }
            ?: throw Exception("Posts with tag name [$tagName] not found")
    }

    fun searchPostsByTag(request: PageableByStringRequest): Page<Post> {
        val tagName = request.word.lowercase()
        val pageable: Pageable = PageRequest.of(
            request.page,
            request.size,
        )

        return postRepository.findAllByTagName(tagName, pageable)
    }

    fun getPageablePostsByUser(pageableByStringRequest: PageableByStringRequest): Page<Post> =
        postRepository.findAllByUserUsername(
            pageableByStringRequest.word,
            PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)
        )


    fun getPostsByUser(username: String): List<Post> =
        postRepository.findAllByUserUsername(username)



    fun getPostsOfFollowingForUser(pageableByStringRequest: PageableByStringRequest): Page<Post> {
        val pageable = PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)

        val followedUsers = followService.getUsersFollowedBy(pageableByStringRequest.word)

        val latestPosts = followedUsers
            .mapNotNull { user -> getLatestPostByUsername(user.username) }
            .sortedByDescending { it.createdAt }

        val start = (pageable.pageNumber * pageable.pageSize).coerceAtMost(latestPosts.size)
        val end = (start + pageable.pageSize).coerceAtMost(latestPosts.size)

        val pagedPosts = if (start < latestPosts.size) latestPosts.subList(start, end) else emptyList()

        return PageImpl(pagedPosts, pageable, latestPosts.size.toLong())
    }


    fun getLatestPostsFromNonFollowedUsers(pageableByStringRequest: PageableByStringRequest): Page<Post> {
        val usersNotFollowed = followService.getUsersNotFollowedBy(pageableByStringRequest.word)

        val latestPosts = usersNotFollowed
            .mapNotNull { user -> getLatestPostByUsername(user.username) }
            .sortedByDescending { it.createdAt }

        val pageable = PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)

        val start = (pageable.pageNumber * pageable.pageSize).coerceAtMost(latestPosts.size)
        val end = (start + pageable.pageSize).coerceAtMost(latestPosts.size)

        val pagedPosts = if (start < latestPosts.size) latestPosts.subList(start, end) else emptyList()

        return PageImpl(pagedPosts, pageable, latestPosts.size.toLong())
    }


    fun getLatestPostByUsername(username: String): Post? {
        val pageable = PageRequest.of(0, 1)
        return postRepository.findLatestPostByUsername(username, pageable)
            .content
            .firstOrNull()
    }

    fun findByImageId(imageId:Long) :Post? {
        return this.postRepository.findByImageId(imageId)
    }


    fun getAllPostIds(): List<Long> {
        return postRepository.findAllPostIds()
    }

    fun updatePostImageId(postId: Long, imageId: Long) {
        val post = postRepository.findById(postId).orElseThrow {
            RuntimeException("Post not found with id: $postId")
        }

        val updatedImage = imageService.getImageById(imageId = imageId)
        val updatedPost = post.copy(image = updatedImage)
        postRepository.save(updatedPost)
    }

}
