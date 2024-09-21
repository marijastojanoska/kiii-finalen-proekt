package com.sorsix.backend.config

import com.sorsix.backend.api.request.*
import com.sorsix.backend.domain.enumeration.ReactionType
import com.sorsix.backend.repository.UserRepository
import com.sorsix.backend.service.*
import jakarta.annotation.PostConstruct
import org.springframework.core.io.Resource
import org.springframework.core.io.ResourceLoader
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.random.Random

@Component
class DataInitializer(
    private val authService: AuthService,
    private val postService: PostService,
    private val commentService: CommentService,
    private val followService: FollowService,
    private val reactionService: ReactionService,
    private val userProfileService: UserProfileService,
    private val imageService: ImageService,
    private val resourceLoader: ResourceLoader,
    private val userRepository: UserRepository,
) {

    private val postSentences = listOf(
        "What a #beautiful #sunny #day!",
        "Hello #everyone, how are you?",
        "Haha, this is really #funny!",
        "Just finished a great #book, highly #recommend it!",
        "Feeling #great after a long #workout.",
        "Excited for the #weekend!",
        "Had a wonderful #dinner with #friends.",
        "Can't wait for the upcoming #movie release.",
        "The weather is #perfect for a walk in the #park.",
        "Just adopted a new #pet, meet Bella!"
    )

    private val commentSentences = listOf(
        "I totally agree with you!",
        "This is amazing, thanks for sharing!",
        "I've had a similar experience before.",
        "Wow, this is so interesting.",
        "I love this, very insightful!",
        "Could you share more details?",
        "This made my day!",
        "So true, couldn't have said it better.",
        "Great post, keep it up!",
        "This is really helpful, thanks!"
    )

    private val replySentences = listOf(
        "Thanks for your input!",
        "I appreciate your comment.",
        "Glad you liked it!",
        "I'll definitely consider that.",
        "Your feedback is valuable.",
        "Thanks for sharing your thoughts!",
        "I agree with your point.",
        "That's a great addition to the discussion.",
        "I'll look into it more.",
        "Interesting perspective!"
    )

    private fun uploadImagesFromDirectory(directoryPath: String) {
        val resource = resourceLoader.getResource("classpath:$directoryPath")

        if (resource.exists()) {
            try {
                val resourcePattern = "classpath:$directoryPath/*.{jpeg,jpg,png}"
                val resources = PathMatchingResourcePatternResolver().getResources(resourcePattern)

                resources.sortedBy { it.filename }.forEach { fileResource ->
                    try {
                        val imageBytes = fileResource.inputStream.readBytes()
                        val fileName = fileResource.filename ?: return@forEach

                        val imageRequest = ImageRequest(
                            image = imageBytes,
                            name = fileName.substringBeforeLast("."),
                            type = fileName.substringAfterLast(".")
                        )

                        val image = imageService.createImage(imageRequest)
                        println("Uploaded image: $fileName, ID: ${image.id}")
                    } catch (e: IOException) {
                        println("Failed to upload image: ${fileResource.filename}, error: ${e.message}")
                    }
                }
            } catch (e: IOException) {
                println("Failed to access resources in $directoryPath, error: ${e.message}")
            }
        } else {
            println("Directory $directoryPath does not exist or is not accessible.")
        }
    }


    private fun generateUniqueDateOfBirth(index: Int): LocalDate {
        val startDate = LocalDate.of(2000, 1, 1)
        val endDate = LocalDate.of(2003, 1, 1)
        val daysBetween = ChronoUnit.DAYS.between(startDate, endDate)
        val randomDayOffset = Random.nextLong(daysBetween)
        return startDate.plusDays(randomDayOffset)
    }

    @PostConstruct
    fun initData() {
        if (userRepository.findByUsername("marija.stojanoska") == null) {
            uploadImagesFromDirectory("profile-pictures")
            uploadImagesFromDirectory("post-images")

            val usernames = listOf(
                "marija.stojanoska",
                "martina.videvska",
                "atanas.velchevski",
                "aleksandar.blazhevski",
                "blagoj.petkov",
                "dario.martinovski",
                "bojan.vuchkov",
                "matej.todorovski",
                "mila.anastasova",
                "teona.shambar",
                "filip.naskovski",
                "andrej.srbinovski",
                "sanja.vasilova",
                "jovan.mihov"
            )

            usernames.mapIndexed { index, username ->
                authService.register(
                    RegisterRequest(
                        username = username,
                        firstName = username.split(".").first().capitalize(),
                        lastName = username.split(".").last().capitalize(),
                        email = "$username@example.com",
                        password = "Test1!",
                        confirmPassword = "Test1!"
                    )
                )
                val dateOfBirth = generateUniqueDateOfBirth(index)
                userProfileService.updateUserProfile(
                    UserProfileRequest(
                        username = username,
                        bio = "Hi, I am a software developer intern at Sorsix",
                        profilePictureId = index.toLong() + 1,
                        dateOfBirth = dateOfBirth
                    )
                )
            }

            usernames.forEachIndexed { index, user ->
                val others = usernames.filterIndexed { i, _ -> i != index }
                val followLimit = minOf(5, others.size)
                repeat(followLimit) {
                    followService.followUser(user, others[it % others.size])
                }
            }

            val postIdsByUser = mutableMapOf<String, List<Long>>()

            usernames.forEachIndexed { _, user ->
                val postIds = (1..(5..10).random()).map { _ ->
                    postService.createPost(
                        PostRequest(
                            username = user,
                            content = postSentences.random()
                        )
                    ).id
                }
                postIdsByUser[user] = postIds
            }


            val allPostIds = postService.getAllPostIds()
            val selectedPostIds = allPostIds.shuffled().take(36)
            val imageIds = (15..50).toList().shuffled()
            val postIdImageIdMap = selectedPostIds.zip(imageIds).toMap()

            postIdImageIdMap.forEach { (postId, imageId) ->
                postService.updatePostImageId(postId, imageId.toLong())
            }


            postIdsByUser.values.flatten().forEach { postId ->
                (1..(1..5).random()).map { _ ->
                    commentService.createComment(
                        CommentRequest(
                            username = usernames[Random.nextInt(usernames.size)],
                            postId = postId,
                            content = commentSentences.random(),
                            parentId = null
                        )
                    )
                }
            }

            postIdsByUser.values.flatten().forEach { postId ->
                val numReplies = Random.nextInt(1, 3)
                val commentIds = commentService.findAllTopLevelCommentIdsByPostId(postId)
                repeat(numReplies) {
                    val parentId = commentIds[Random.nextInt(commentIds.size)]
                    commentService.createComment(
                        CommentRequest(
                            username = usernames[Random.nextInt(usernames.size)],
                            postId = postId,
                            content = replySentences.random(),
                            parentId = parentId
                        )
                    )
                }
            }

            usernames.forEach { user ->
                val postIdFetched = postService.getAllPostIds()
                val numReactions = Random.nextInt(40, 70).coerceAtMost(allPostIds.size)

                postIdFetched.shuffled().take(numReactions).forEach { postId ->
                    val reactionType = ReactionType.entries.toTypedArray().random()
                    reactionService.createReaction(
                        ReactionRequest(
                            username = user,
                            type = reactionType.name,
                            postId = postId
                        )
                    )
                }
            }


        }
    }

}
