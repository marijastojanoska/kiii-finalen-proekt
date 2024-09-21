package com.sorsix.backend.service

import com.sorsix.backend.api.request.FollowRequest
import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.domain.entity.Follow
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.repository.FollowRepository
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service

@Service
class FollowService(
    private val followRepository: FollowRepository,
    private val userService: UserService,
    @Lazy private val notificationService: NotificationService
) {

    fun followUser(followerUsername: String, followedUsername: String): Follow {
        val follower = userService.getUserByUsername(followerUsername)
        val followed = userService.getUserByUsername(followedUsername)

        if (followRepository.existsByFollowerAndFollowed(follower, followed)) {
            throw Exception("User with username [${follower.username}] is already following the user with username [${followed.username}]")
        }

        return Follow(
            follower = follower,
            followed = followed
        ).also { follow ->
            followRepository.save(follow)
            notificationService.notifyUser(followed, "${follower.username} followed you", follower)
        }
    }


    fun unfollowUser(followerUsername: String, followedUsername: String) {
        val follower = userService.getUserByUsername(followerUsername)
        val followed = userService.getUserByUsername(followedUsername)

        followRepository.findByFollowerAndFollowed(follower, followed)?.let {
            followRepository.delete(it)
        } ?: throw Exception("Follow relationship does not exist")
    }

    fun getFollowersForUser(username: String): List<User> {
        val user = userService.getUserByUsername(username)
        val follows = followRepository.findAllByFollowedOrderByCreatedAtDesc(user)
        return follows.map { it.follower }
    }

    fun getFollowingForUser(username: String): List<User> {
        val user = userService.getUserByUsername(username)
        val follows = followRepository.findAllByFollowerOrderByCreatedAtDesc(user)
        return follows.map { it.followed }
    }

    fun getByFollower(user: User): List<Follow> {
        return followRepository.findAllByFollowerOrderByCreatedAtDesc(user)
    }

    fun getByFollowed(user: User): List<Follow> {
        return followRepository.findAllByFollowedOrderByCreatedAtDesc(user)
    }

    fun getFollowersCount(username: String): Long {
        val user = userService.getUserByUsername(username)
        return followRepository.countByFollowed(user)
    }

    fun getFollowingCount(username: String): Long {
        val user = userService.getUserByUsername(username)
        return followRepository.countByFollower(user)
    }

    fun getLastNFollowers(pageableByStringRequest: PageableByStringRequest): Page<User> {
        val user = userService.getUserByUsername(pageableByStringRequest.word)
        val pageable = PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)
        return followRepository.findLastNFollowers(user, pageable)
            .map { it.follower }
    }

    fun getLastNFollowing(pageableByStringRequest: PageableByStringRequest): Page<User> {
        val user = userService.getUserByUsername(pageableByStringRequest.word)
        val pageable = PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)
        return followRepository.findLastNFollowing(user, pageable)
            .map { it.followed }
    }


    fun getUsersNotFollowedBy(username: String): List<User> {
        val user = userService.getUserByUsername(username)
        return followRepository.findUsersNotFollowedBy(user)
    }

    fun getUsersFollowedBy(username: String): List<User> {
        val user = userService.getUserByUsername(username)
        return followRepository.findUsersFollowedBy(user)
    }

    fun existsByFollowerAndFollowed(followRequest: FollowRequest): Boolean {
        val follower = userService.getUserByUsername(followRequest.follower)
        val followed = userService.getUserByUsername(followRequest.followed)

        return followRepository.existsByFollowerAndFollowed(
            follower = follower,
            followed = followed
        )
    }


}
