package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.LoginRequest
import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.api.request.UserUpdateRequest
import com.sorsix.backend.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/{username}")
    fun getUserByUsername(@PathVariable username: String): ResponseEntity<Any> {
        return try {
            val user = userService.getUserByUsername(username)
            ResponseEntity.ok(user)
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @GetMapping("/search-by-username")
    fun searchUsersByUsername(@RequestParam username: String): ResponseEntity<Any> {
        return try {
            val users = userService.searchUsersByUsername(username)
            ResponseEntity.ok(users)
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @PostMapping("/search-by-username/pageable")
    fun searchUsersByUsername(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest
    ): ResponseEntity<Any> {
        return try {
            val users = userService.searchUsersByUsername(pageableByStringRequest)
            ResponseEntity.ok(users)
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @PostMapping("/deactivate")
    fun deactivate(
        @RequestBody @Validated loginRequest: LoginRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(userService.deactivateAccount(loginRequest))
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }

    @PutMapping("/{username}")
    fun updateUser(
        @PathVariable username: String,
        @RequestBody updateRequest: UserUpdateRequest,
    ): ResponseEntity<Any> {
        return try {
            val updatedUser = userService.updateUser(
                username,
                updateRequest
            )
            ResponseEntity.ok(updatedUser)
        } catch (ex: Exception) {
            ResponseEntity.badRequest().body(ex.message)
        }
    }
}
