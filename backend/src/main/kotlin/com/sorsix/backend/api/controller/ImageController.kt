package com.sorsix.backend.api.controller

import com.sorsix.backend.api.request.ImageRequest
import com.sorsix.backend.service.ImageService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

@RestController
@CrossOrigin
@RequestMapping("/api/images")
class ImageController(
    private val imageService: ImageService
) {


    @PostMapping
    fun uploadImage(@RequestParam("image") image: MultipartFile): ResponseEntity<Any> {
        return try {
            val originalFilename = image.originalFilename ?: "unknown"
            val (name, type) = originalFilename.split('.').let {
                it.first() to (it.getOrElse(1) { "unknown" })
            }
            val imageEntity = imageService.createImage(
                ImageRequest(
                    image = image.bytes,
                    name = name,
                    type = type
                )
            )
            ResponseEntity.ok(imageEntity)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/{id}")
    fun getImageById(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            val image = imageService.getImageById(id)
            ResponseEntity.ok(image)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteImage(@PathVariable id: Long): ResponseEntity<Any> {
        return try {
            imageService.deleteImage(id)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e.message)
        }
    }

    @GetMapping("/view/{id}")
    fun viewImage(@PathVariable id: Long): ResponseEntity<StreamingResponseBody> {
        return try {
            val image = imageService.getImageById(id)
            ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                .body(StreamingResponseBody { outputStream ->
                    outputStream.write(image.image)
                })
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }


}
