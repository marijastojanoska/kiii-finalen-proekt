package com.sorsix.backend.service

import com.sorsix.backend.api.request.ImageRequest
import com.sorsix.backend.domain.entity.Image
import com.sorsix.backend.repository.ImageRepository
import com.sorsix.backend.repository.PostRepository
import com.sorsix.backend.repository.UserProfileRepository
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayOutputStream
import java.util.*
import java.util.zip.Deflater
import java.util.zip.Inflater

@Service
class ImageService(
    private val imageRepository: ImageRepository,
    @Lazy private val userProfileService: UserProfileService,
    @Lazy private val postService: PostService,
    private val userProfileRepository: UserProfileRepository,
    private val postRepository: PostRepository,
) {
    fun createImage(imageRequest: ImageRequest): Image {
        val image = Image(
            image = imageRequest.image,
            name = imageRequest.name,
            type = imageRequest.type
        )
        return imageRepository.save(image)
    }

    fun getImageById(imageId: Long): Image {
        return imageRepository.findById(imageId).orElseThrow {
            Exception("Image with id [$imageId] not found")
        }
    }

    @Transactional
    fun deleteImage(imageId: Long) {
        if (!imageRepository.existsById(imageId)) {
            throw Exception("Image with id [$imageId] not found")
        }

        val post = postService.findByImageId(imageId)
        post?.let {
            val updatedPost = it.copy(image = null)
            postRepository.save(updatedPost)
        }

        val userProfile = userProfileService.findByProfilePictureId(imageId)
        userProfile?.let {
            val updatedProfile = it.copy(profilePicture = null)
            userProfileRepository.save(updatedProfile)
        }

        imageRepository.deleteById(imageId)
    }


}
