package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/notifications")
class NotificationController(
    val notificationService: NotificationService
) {


    @GetMapping("/{username}")
    fun getNotificationsByUser(
        @PathVariable username: String
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(notificationService.getNotificationsByUser(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/unread-count/{username}")
    fun countByUserUsernameAndReadFalse(
        @PathVariable username: String
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(notificationService.countByUserUsernameAndReadFalse(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/get-by-user/pageable")
    fun getNotificationsByUser(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest
    ): ResponseEntity<Any> {
        return try {
            return ResponseEntity.ok(notificationService.getNotificationsByUser(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PutMapping("/mark-as-read/{id}")
    fun markNotificationAsRead(
        @PathVariable id: Long,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(notificationService.markAsRead(id))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteNotification(
        @PathVariable id: Long,
    ): ResponseEntity<Any> {
        return try {
            notificationService.deleteNotification(id)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/delete-all/{username}")
    fun deleteNotifications(
        @PathVariable username: String,
    ): ResponseEntity<Any> {
        return try {
            notificationService.deleteNotificationsByUserUsername(username)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/mark-as-read-all/{username}")
    fun markAsReadAllNotifications(
        @PathVariable username: String,
    ): ResponseEntity<Any> {
        return try {
            notificationService.markAsReadAllNotifications(username)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }
}
