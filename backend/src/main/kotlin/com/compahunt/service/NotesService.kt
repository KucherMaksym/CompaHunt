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
import java.time.LocalDateTime

@Service
@Transactional
class NotesService(
    private val noteRepository: NoteRepository,
    private val vacancyRepository: VacancyRepository,
    private val interviewRepository: InterviewRepository,
    private val userRepository: UserRepository
) {

    // Vacancy Notes Operations
    fun createVacancyNote(request: CreateVacancyNoteRequest, userId: Long): Note {
        val vacancy = vacancyRepository.findById(request.vacancyId)
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

    fun getVacancyNotes(vacancyId: Long, userId: Long): List<Note> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.findByVacancyIdAndUserId(vacancyId, userId)
    }

    fun getAllVacancyNotesByUser(userId: Long, type: String? = null, priority: String? = null): List<Note> {
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
    fun createInterviewNote(request: CreateInterviewNoteRequest, userId: Long): Note {
        val interview = interviewRepository.findById(request.interviewId)
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

    fun getInterviewNotes(interviewId: Long, userId: Long): List<Note> {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user (through vacancy)
        if (interview.vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.findByInterviewIdAndUserId(interviewId, userId)
    }

    fun getAllInterviewNotesByUser(userId: Long, type: String? = null, priority: String? = null): List<Note> {
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
    fun getNote(noteId: Long, userId: Long): Note {
        return noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")
    }

    fun updateNote(noteId: Long, request: UpdateNoteRequest, userId: Long): Note {
        val note = noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")

        val updatedNote = note.copy(
            content = request.content ?: note.content,
            type = request.type?.let { NoteType.valueOf(it) } ?: note.type,
            priority = request.priority?.let { NotePriority.valueOf(it) } ?: note.priority,
            tags = request.tags ?: note.tags,
            isPrivate = request.isPrivate ?: note.isPrivate,
            updatedAt = LocalDateTime.now()
        )

        return noteRepository.save(updatedNote)
    }

    fun deleteNote(noteId: Long, userId: Long): Boolean {
        val note = noteRepository.findByIdAndUserId(noteId, userId)
            ?: throw IllegalArgumentException("Note not found or access denied")

        noteRepository.delete(note)
        return true
    }

    // Bulk Operations
    fun deleteAllVacancyNotes(vacancyId: Long, userId: Long): Int {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.deleteByVacancyIdAndUserId(vacancyId, userId)
    }

    fun deleteAllInterviewNotes(interviewId: Long, userId: Long): Int {
        val interview = interviewRepository.findById(interviewId)
            .orElseThrow { IllegalArgumentException("Interview not found") }

        // Verify that the interview belongs to the user (through vacancy)
        if (interview.vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return noteRepository.deleteByInterviewIdAndUserId(interviewId, userId)
    }
}