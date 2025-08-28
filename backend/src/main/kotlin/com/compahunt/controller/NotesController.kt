package com.compahunt.controller

import com.compahunt.dto.CreateVacancyNoteRequest
import com.compahunt.dto.CreateInterviewNoteRequest
import com.compahunt.dto.UpdateNoteRequest
import com.compahunt.dto.VacancyNoteResponse
import com.compahunt.dto.InterviewNoteResponse
import com.compahunt.model.UserPrincipal
import com.compahunt.service.NotesService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = ["*"])
class NotesController(
    private val notesService: NotesService
) {

    // Vacancy Notes Endpoints
    @PostMapping("/vacancy")
    fun createVacancyNote(
        @RequestBody noteRequest: CreateVacancyNoteRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val note = notesService.createVacancyNote(noteRequest, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "note" to VacancyNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        ))
    }

    @GetMapping("/vacancy/{vacancyId}")
    fun getVacancyNotes(
        @PathVariable vacancyId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<VacancyNoteResponse>> {
        val userId = getUserId(authentication)
        val notes = notesService.getVacancyNotes(vacancyId, userId)
        val noteResponses = notes.map { note ->
            VacancyNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        }
        return ResponseEntity.ok(noteResponses)
    }

    @GetMapping("/vacancy")
    fun getAllVacancyNotes(
        authentication: Authentication,
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) priority: String?
    ): ResponseEntity<List<VacancyNoteResponse>> {
        val userId = getUserId(authentication)
        val notes = notesService.getAllVacancyNotesByUser(userId, type, priority)
        val noteResponses = notes.map { note ->
            VacancyNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        }
        return ResponseEntity.ok(noteResponses)
    }

    // Interview Notes Endpoints
    @PostMapping("/interview")
    fun createInterviewNote(
        @RequestBody noteRequest: CreateInterviewNoteRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val note = notesService.createInterviewNote(noteRequest, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "success" to true,
            "note" to InterviewNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        ))
    }

    @GetMapping("/interview/{interviewId}")
    fun getInterviewNotes(
        @PathVariable interviewId: UUID,
        authentication: Authentication
    ): ResponseEntity<List<InterviewNoteResponse>> {
        val userId = getUserId(authentication)
        val notes = notesService.getInterviewNotes(interviewId, userId)
        val noteResponses = notes.map { note ->
            InterviewNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        }
        return ResponseEntity.ok(noteResponses)
    }

    @GetMapping("/interview")
    fun getAllInterviewNotes(
        authentication: Authentication,
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) priority: String?
    ): ResponseEntity<List<InterviewNoteResponse>> {
        val userId = getUserId(authentication)
        val notes = notesService.getAllInterviewNotesByUser(userId, type, priority)
        val noteResponses = notes.map { note ->
            InterviewNoteResponse(
                id = note.id,
                content = note.content,
                type = note.type.name,
                priority = note.priority.name,
                tags = note.tags,
                isPrivate = note.isPrivate,
                createdAt = note.createdAt.toString(),
                updatedAt = note.updatedAt.toString()
            )
        }
        return ResponseEntity.ok(noteResponses)
    }

    // Generic Note Operations (works for both vacancy and interview notes)
    @GetMapping("/{id}")
    fun getNote(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val note = notesService.getNote(id, userId)
        
        return when {
            note.vacancy != null -> ResponseEntity.ok(mapOf(
                "type" to "vacancy",
                "note" to VacancyNoteResponse(
                    id = note.id,
                    content = note.content,
                    type = note.type.name,
                    priority = note.priority.name,
                    tags = note.tags,
                    isPrivate = note.isPrivate,
                    createdAt = note.createdAt.toString(),
                    updatedAt = note.updatedAt.toString()
                )
            ))
            note.interview != null -> ResponseEntity.ok(mapOf(
                "type" to "interview",
                "note" to InterviewNoteResponse(
                    id = note.id,
                    content = note.content,
                    type = note.type.name,
                    priority = note.priority.name,
                    tags = note.tags,
                    isPrivate = note.isPrivate,
                    createdAt = note.createdAt.toString(),
                    updatedAt = note.updatedAt.toString()
                )
            ))
            else -> throw IllegalStateException("Note must be associated with either a vacancy or an interview")
        }
    }

    @PutMapping("/{id}")
    fun updateNote(
        @PathVariable id: UUID,
        @RequestBody updateRequest: UpdateNoteRequest,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val note = notesService.updateNote(id, updateRequest, userId)
        
        return when {
            note.vacancy != null -> ResponseEntity.ok(mapOf(
                "success" to true,
                "type" to "vacancy",
                "note" to VacancyNoteResponse(
                    id = note.id,
                    content = note.content,
                    type = note.type.name,
                    priority = note.priority.name,
                    tags = note.tags,
                    isPrivate = note.isPrivate,
                    createdAt = note.createdAt.toString(),
                    updatedAt = note.updatedAt.toString()
                )
            ))
            note.interview != null -> ResponseEntity.ok(mapOf(
                "success" to true,
                "type" to "interview",
                "note" to InterviewNoteResponse(
                    id = note.id,
                    content = note.content,
                    type = note.type.name,
                    priority = note.priority.name,
                    tags = note.tags,
                    isPrivate = note.isPrivate,
                    createdAt = note.createdAt.toString(),
                    updatedAt = note.updatedAt.toString()
                )
            ))
            else -> throw IllegalStateException("Note must be associated with either a vacancy or an interview")
        }
    }

    @DeleteMapping("/{id}")
    fun deleteNote(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val success = notesService.deleteNote(id, userId)
        return if (success) {
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Note deleted successfully"
            ))
        } else {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to "Failed to delete note"
            ))
        }
    }

    // Bulk Operations
    @DeleteMapping("/vacancy/{vacancyId}")
    fun deleteAllVacancyNotes(
        @PathVariable vacancyId: UUID,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val count = notesService.deleteAllVacancyNotes(vacancyId, userId)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Deleted $count notes successfully"
        ))
    }

    @DeleteMapping("/interview/{interviewId}")
    fun deleteAllInterviewNotes(
        @PathVariable interviewId: UUID,
        authentication: Authentication
    ): ResponseEntity<Map<String, Any>> {
        val userId = getUserId(authentication)
        val count = notesService.deleteAllInterviewNotes(interviewId, userId)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Deleted $count notes successfully"
        ))
    }

    private fun getUserId(authentication: Authentication): UUID {
        return when (val principal = authentication.principal) {
            is UserPrincipal -> principal.id
            is Map<*, *> -> {
                // Fallback for JWT token claims
                val claims = principal as Map<String, Any>
                UUID.fromString(claims["sub"] as String)
            }
            else -> throw IllegalArgumentException("Unsupported principal type: ${principal::class.java}")
        }
    }
}