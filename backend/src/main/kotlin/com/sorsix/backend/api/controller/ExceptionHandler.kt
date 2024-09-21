package com.sorsix.backend.api.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus

@ControllerAdvice
@CrossOrigin
class ExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<String> {
        val errors = ex.bindingResult.allErrors
            .joinToString(", ") {
                it.defaultMessage ?: "Invalid input"
            }

        return ResponseEntity(errors, HttpStatus.BAD_REQUEST)
    }

}
