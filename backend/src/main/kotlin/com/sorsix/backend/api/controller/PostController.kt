package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.PageableByStringRequest
import com.sorsix.backend.api.request.PostRequest
import com.sorsix.backend.service.PostService
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin
@RequestMapping("/api/posts")
class PostController(
    val postService: PostService
) {

    @GetMapping("{id}")
    fun getPostById(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.getPostById(id))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping
    fun createPost(
        @RequestBody @Validated postRequest: PostRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.createPost(postRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PutMapping("{id}")
    fun updatePost(
        @PathVariable id: Long,
        @RequestBody postRequest: PostRequest
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.updatePost(id, postRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("{id}")
    fun deletePost(
        @PathVariable id: Long,
    ): ResponseEntity<Any> {
        return try {
            postService.deletePost(id)
            ResponseEntity.ok().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/following/last")
    fun getPostsOfFollowingForUser(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.getPostsOfFollowingForUser(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }


    @GetMapping("/search-by-tag")
    fun searchPostsByTag(@RequestParam tag: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.searchPostsByTag(tag))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/search-by-tag/pageable")
    fun searchPostsByTag(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest
    ): ResponseEntity<Any> {
        return try {
            val result = postService.searchPostsByTag(pageableByStringRequest)
            ResponseEntity.ok(result)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/search-by-user/pageable")
    fun getPageablePostsByUser(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest,
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.getPageablePostsByUser(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/user/{username}")
    fun getAllPostsByUser(@PathVariable username: String): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.getPostsByUser(username))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @PostMapping("/non-followed")
    fun getLatestPostsFromNonFollowedUsers(
        @Validated @RequestBody pageableByStringRequest: PageableByStringRequest
    ): ResponseEntity<Any> {
        return try {
            ResponseEntity.ok(postService.getLatestPostsFromNonFollowedUsers(pageableByStringRequest))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }
}
