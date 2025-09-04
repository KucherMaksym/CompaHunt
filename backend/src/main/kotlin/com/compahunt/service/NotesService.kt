package com.compahunt.service

import com.compahunt.dto.CreateVacancyNoteRequest
import com.compahunt.dto.CreateInterviewNoteRequest
import com.compahunt.dto.UpdateNoteRequest
import com.compahunt.model.Note
import com.compahunt.model.NoteType
import com.compahunt.model.NotePriority
import com.compahunt.repository.NoteRepository
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.InterviewRepository
import com.compahunt.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.*

@Service
@Transactional
class NotesService(
    private val noteRepository: NoteRepository,
    private val vacancyRepository: VacancyRepository,
    private val interviewRepository: InterviewRepository,
    private val userRepository: UserRepository
) {

    // Vacancy Notes Operations
    fun createVacancyNote(request: CreateVacancyNoteRequest, userId: UUID): Note {
        val vacancyId = request.vacancyId ?: throw IllegalArgumentException("Vacancy ID is required")
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }
        
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        val note = Note(
            vacancy = vacancy,
            user = user,
            content = request.content,
            type = NoteType.valueOf(request.type),
            priority = NotePriority.valueOf(request.priority),
            tags = request.tags,
            isPrivate = request.isPrivate
        )

        return noteRepository.save(note)
    }

    fun getVacancyNotes(vacancyId: UUID, userId: UUID): List<Note> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.findByVacancyIdAndUserId(vacancyId, userId)
    }

    fun getAllVacancyNotesByUser(userId: UUID, type: String? = null, priority: String? = null): List<Note> {
        return when {
            type != null && priority != null -> {
                noteRepository.findVacancyNotesByUserIdAndTypeAndPriority(
                    userId, 
                    NoteType.valueOf(type), 
                    NotePriority.valueOf(priority)
                )
            }
            type != null -> {
                noteRepository.findVacancyNotesByUserIdAndType(userId, NoteType.valueOf(type))
            }
            priority != null -> {
                noteRepository.findVacancyNotesByUserIdAndPriority(userId, NotePriority.valueOf(priority))
            }
            else -> {
                noteRepository.findVacancyNotesByUserId(userId)
            }
        }
    }

    // Interview Notes Operations
    fun createInterviewNote(request: CreateInterviewNoteRequest, userId: UUID): Note {
        val interviewId = request.interviewId ?: throw IllegalArgumentException("Interview ID is required")
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }
        
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        // Verify that the interview belongs to the user (through vacancy)
        if (interview.vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        val note = Note(
            interview = interview,
            user = user,
            content = request.content,
            type = NoteType.valueOf(request.type),
            priority = NotePriority.valueOf(request.priority),
            tags = request.tags,
            isPrivate = request.isPrivate
        )

        return noteRepository.save(note)
    }

    fun getInterviewNotes(interviewId: UUID, userId: UUID): List<Note> {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user (through vacancy)
        if (interview.vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.findByInterviewIdAndUserId(interviewId, userId)
    }

    fun getAllInterviewNotesByUser(userId: UUID, type: String? = null, priority: String? = null): List<Note> {
        return when {
            type != null && priority != null -> {
                noteRepository.findInterviewNotesByUserIdAndTypeAndPriority(
                    userId, 
                    NoteType.valueOf(type), 
                    NotePriority.valueOf(priority)
                )
            }
            type != null -> {
                noteRepository.findInterviewNotesByUserIdAndType(userId, NoteType.valueOf(type))
            }
            priority != null -> {
                noteRepository.findInterviewNotesByUserIdAndPriority(userId, NotePriority.valueOf(priority))
            }
            else -> {
                noteRepository.findInterviewNotesByUserId(userId)
            }
        }
    }

    // Generic Note Operations
    fun getNote(noteId: UUID, userId: UUID): Note {
        return noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")
    }

    fun updateNote(noteId: UUID, request: UpdateNoteRequest, userId: UUID): Note {
        val note = noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")

        val updatedNote = note.copy(
            content = request.content ?: note.content,
            type = request.type?.let { NoteType.valueOf(it) } ?: note.type,
            priority = request.priority?.let { NotePriority.valueOf(it) } ?: note.priority,
            tags = request.tags ?: note.tags,
            isPrivate = request.isPrivate ?: note.isPrivate,
            updatedAt = Instant.now()
        )

        return noteRepository.save(updatedNote)
    }

    fun deleteNote(noteId: UUID, userId: UUID): Boolean {
        val note = noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")

        noteRepository.delete(note)
        return true
    }

    // Bulk Operations
    fun deleteAllVacancyNotes(vacancyId: UUID, userId: UUID): Int {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.deleteByVacancyIdAndUserId(vacancyId, userId)
    }

    fun deleteAllInterviewNotes(interviewId: UUID, userId: UUID): Int {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user (through vacancy)
        if (interview.vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.deleteByInterviewIdAndUserId(interviewId, userId)
    }
}