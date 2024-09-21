package com.sorsix.backend.service

import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.domain.entity.Notification
import com.sorsix.backend.domain.entity.User
import com.sorsix.backend.repository.NotificationRepository
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    @Lazy private val followService: FollowService
) {

    fun notifyUser(receiver: User, message: String, sender: User): Notification? {
        if (receiver.username == sender.username) {
            return null
        }
        val notification = Notification(
            user = receiver,
            message = message
        )
        return notificationRepository.save(notification)
    }

    @Transactional
    fun notifyFollowers(followedUser: User, message: String): List<Notification> {
        val followers = followService.getByFollowed(followedUser)
        val notifications = mutableListOf<Notification>()
        followers.forEach { follow ->
            notifyUser(follow.follower, message, followedUser)?.let { notifications.add(it) }
        }
        return notifications
    }


    fun getNotificationById(notificationId: Long): Notification = notificationRepository.findById(notificationId)
        .orElseThrow { (Exception("Notification with id [$notificationId] not found")) }

    fun getNotificationsByUser(username: String): List<Notification> =
        notificationRepository.findAllByUserUsernameOrderByCreatedAtDesc(username)

    fun getNotificationsByUser(pageableByStringRequest: PageableByStringRequest): Page<Notification> =
        notificationRepository.findAllByUserUsernameOrderByCreatedAtDesc(
            pageableByStringRequest.word, PageRequest.of(pageableByStringRequest.page, pageableByStringRequest.size)
        )

    fun markAsRead(notificationId: Long): Notification {
        val notification = getNotificationById(notificationId)

        val updatedNotification = notification.copy(read = true)
        return notificationRepository.save(updatedNotification)
    }

    fun deleteNotification(notificationId: Long) = notificationRepository.deleteById(notificationId)

    @Transactional
    fun deleteNotificationsByUserUsername(username: String) = notificationRepository.deleteAllByUserUsername(username)

    @Transactional
    fun markAsReadAllNotifications(username: String) {
        val notifications = this.notificationRepository.findAllByUserUsername(username)
        val updatedNotifications = notifications.map { notification ->
            notification.copy(read = true)
        }
        this.notificationRepository.saveAll(updatedNotifications)
    }

    fun countByUserUsernameAndReadFalse(username: String): Long {
        return this.notificationRepository.countByUserUsernameAndReadFalse(username)
    }


}

