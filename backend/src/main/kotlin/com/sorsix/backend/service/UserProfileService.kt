package com.sorsix.backend.service

import com.sorsix.backend.api.request.UserProfileRequest
import com.sorsix.backend.api.response.UserProfileResponse
import com.sorsix.backend.domain.entity.UserProfile
import com.sorsix.backend.repository.UserProfileRepository
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class UserProfileService(
    private val userProfileRepository: UserProfileRepository,
    @Lazy private val imageService: ImageService
) {

    private fun mapToResponse(userProfile: UserProfile): UserProfileResponse {
        return UserProfileResponse(
            user = userProfile.user,
            bio = userProfile.bio,
            profilePicture = userProfile.profilePicture,
            dateOfBirth = userProfile.dateOfBirth,
            createdAt = userProfile.createdAt
        )
    }

    fun getUserProfileById(userProfileId: Long): UserProfileResponse {
        val userProfile = userProfileRepository.findById(userProfileId)
            .orElseThrow { Exception("User profile with id [$userProfileId] not found") }
        return mapToResponse(userProfile)
    }

    fun getUserProfileByUsername(username: String): UserProfileResponse {
        val userProfile = userProfileRepository.findByUserUsername(username)
            ?: throw Exception("User profile with username [$username] not found")
        return mapToResponse(userProfile)
    }

    fun updateUserProfile(userProfileRequest: UserProfileRequest): UserProfileResponse {
        val existingUserProfile = userProfileRepository.findByUserUsername(userProfileRequest.username)
            ?: throw Exception("User profile with username [${userProfileRequest.username}] not found")

        userProfileRequest.dateOfBirth?.let {
            if (it.isAfter(LocalDate.now())) {
                throw Exception("Date of birth must be from the past")
            }
        }

        val profilePicture = userProfileRequest.profilePictureId?.let { imageService.getImageById(it) }

        val updatedProfile = existingUserProfile.copy(
            bio = userProfileRequest.bio ?: existingUserProfile.bio,
            profilePicture = profilePicture ?: existingUserProfile.profilePicture,
            dateOfBirth = userProfileRequest.dateOfBirth ?: existingUserProfile.dateOfBirth
        )

        return mapToResponse(userProfileRepository.save(updatedProfile))
    }

    fun findByProfilePictureId(profilePictureId: Long): UserProfile? {
        return this.userProfileRepository.findByProfilePictureId(profilePictureId)
    }

}
