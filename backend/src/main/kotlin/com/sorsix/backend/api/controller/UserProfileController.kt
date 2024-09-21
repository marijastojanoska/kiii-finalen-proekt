package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.UserProfileRequest
import com.sorsix.backend.service.UserProfileService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/user-profiles")
class UserProfileController(
    private val userProfileService: UserProfileService
) {
    @GetMapping("/{username}")
    fun getUserProfileByUsername(
        @PathVariable username: String
    ): ResponseEntity<Any> {
        return try {
            val userProfile = userProfileService.getUserProfileByUsername(username)
            ResponseEntity.ok(userProfile)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping
    fun saveUserProfile(
        @RequestBody @Validated userProfileRequest: UserProfileRequest,
    ): ResponseEntity<Any> {
        return try {
            val updatedUserProfile = userProfileService.updateUserProfile(userProfileRequest)
            ResponseEntity.ok(updatedUserProfile)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

}
