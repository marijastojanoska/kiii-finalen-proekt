package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.FollowRequest
import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.service.FollowService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api")
class FollowController(
    val followService: FollowService
) {

    @PostMapping("/follow")
    fun follow(
        @RequestBody followRequest: FollowRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.followUser(followRequest.follower, followRequest.followed))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/unfollow")
    fun unfollow(
        @RequestBody followRequest: FollowRequest,
    ): ResponseEntity<Any> {
        return try {
            followService.unfollowUser(followRequest.follower, followRequest.followed)
            ResponseEntity.ok().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/followers")
    fun getFollowers(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getFollowersForUser(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/following")
    fun getFollowing(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getFollowingForUser(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/followers/count")
    fun getFollowersCount(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getFollowersCount(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/following/count")
    fun getFollowingCount(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getFollowingCount(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/followers/last")
    fun getLastNFollowers(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getLastNFollowers(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/following/last")
    fun getLastNFollowing(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getLastNFollowing(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/follow/check")
    fun existsByFollowerAndFollowed(
        @Validated @RequestBody followRequest: FollowRequest,
    ): ResponseEntity<Boolean> {
        return try {
            ResponseEntity.ok(followService.existsByFollowerAndFollowed(followRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }
    @GetMapping("/not-following")
    fun getNotFollowingUsers(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(followService.getUsersNotFollowedBy(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }}
