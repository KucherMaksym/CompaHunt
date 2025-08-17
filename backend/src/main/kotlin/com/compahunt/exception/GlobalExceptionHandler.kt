package com.compahunt.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import jakarta.persistence.EntityNotFoundException
import org.springframework.http.HttpStatus
import org.springframework.validation.FieldError
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger: Logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(VacancyNotFoundException::class)
    fun handleVacancyNotFound(ex: VacancyNotFoundException): ResponseEntity<ErrorResponse> {
        logger.warn("Vacancy not found: {}", ex.message)
        val error = ErrorResponse(
            status = HttpStatus.NOT_FOUND.value(),
            message = ex.message ?: "Vacancy not found",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error)
    }

    @ExceptionHandler(DuplicateVacancyException::class)
    fun handleDuplicateVacancy(ex: DuplicateVacancyException): ResponseEntity<Map<String, Any>> {
        logger.warn("Duplicate vacancy attempt: {}", ex.message)
        return ResponseEntity.badRequest().body(mapOf(
            "success" to false,
            "message" to ex.message as Any,
            "error" to "DUPLICATE_URL"
        ))
    }

    @ExceptionHandler(InvalidVacancyDataException::class)
    fun handleInvalidVacancyData(ex: InvalidVacancyDataException): ResponseEntity<ErrorResponse> {
        logger.warn("Invalid vacancy data: {}", ex.message)
        val error = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Invalid vacancy data",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.badRequest().body(error)
    }

    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(ex: UnauthorizedException): ResponseEntity<ErrorResponse> {
        logger.warn("Unauthorized access attempt: {}", ex.message)
        val error = ErrorResponse(
            status = HttpStatus.FORBIDDEN.value(),
            message = ex.message ?: "Access denied",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<*> {
        logger.warn("Validation error: {}", ex.message)
        val errors = ex.bindingResult.fieldErrors.associate {
            it.field to (it.defaultMessage ?: "Validation error")
        }
        return ResponseEntity.badRequest().body(mapOf("errors" to errors))
    }

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleEntityNotFound(ex: EntityNotFoundException): ResponseEntity<ErrorResponse> {
        logger.warn("Entity not found: {}", ex.message)
        val error = ErrorResponse(
            status = HttpStatus.NOT_FOUND.value(),
            message = ex.message ?: "Entity not found",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        logger.warn("Illegal argument: {}", ex.message)
        val error = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            message = ex.message ?: "Invalid argument",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.badRequest().body(error)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unexpected error occurred: {}", ex.message, ex)
        val error = ErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = "Internal server error",
            timestamp = System.currentTimeMillis()
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error)
    }
}

data class ErrorResponse(
    val status: Int,
    val message: String,
    val timestamp: Long
)

data class ValidationErrorResponse(
    val status: Int,
    val message: String,
    val errors: Map<String, String>,
    val timestamp: Long
)