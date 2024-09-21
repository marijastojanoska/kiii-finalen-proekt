package com.sorsix.backend.api.controller

import com.sorsix.backend.service.ImageService
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

@RestController
@CrossOrigin
@RequestMapping("/api/demo")
class DemoController(
    private val imageService: ImageService,
) {

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