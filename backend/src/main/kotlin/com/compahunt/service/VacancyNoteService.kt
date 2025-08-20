package com.compahunt.service

import com.compahunt.dto.CreateNoteRequest
import com.compahunt.dto.UpdateNoteRequest
import com.compahunt.model.VacancyNote
import com.compahunt.model.NoteType
import com.compahunt.model.NotePriority
import com.compahunt.repository.VacancyNoteRepository
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class VacancyNoteService(
    private val vacancyNoteRepository: VacancyNoteRepository,
    private val vacancyRepository: VacancyRepository,
    private val userRepository: UserRepository
) {

    fun createNote(request: CreateNoteRequest, userId: Long): VacancyNote {
        val vacancy = vacancyRepository.findById(request.vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }
        
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        // Check if a note already exists for this vacancy (allowing only 1 note per vacancy)
        val existingNotes = vacancyNoteRepository.findByVacancyIdOrderByCreatedAtDesc(request.vacancyId)
        if (existingNotes.isNotEmpty()) {
            throw IllegalArgumentException("A note already exists for this vacancy. Only one note per vacancy is allowed.")
        }

        val note = VacancyNote(
            vacancy = vacancy,
            user = user,
            content = request.content,
            type = NoteType.valueOf(request.type),
            priority = NotePriority.valueOf(request.priority),
            tags = request.tags,
            isPrivate = request.isPrivate
        )

        return vacancyNoteRepository.save(note)
    }

    fun updateNote(noteId: Long, request: UpdateNoteRequest, userId: Long): VacancyNote {
        val note = vacancyNoteRepository.findById(noteId)
            .orElseThrow { IllegalArgumentException("Note not found") }

        // Verify that the note belongs to the user
        if (note.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        val updatedNote = note.copy(
            content = request.content ?: note.content,
            type = request.type?.let { NoteType.valueOf(it) } ?: note.type,
            priority = request.priority?.let { NotePriority.valueOf(it) } ?: note.priority,
            tags = request.tags ?: note.tags,
            isPrivate = request.isPrivate ?: note.isPrivate,
            updatedAt = LocalDateTime.now()
        )

        return vacancyNoteRepository.save(updatedNote)
    }

    fun getNotesByVacancy(vacancyId: Long, userId: Long): List<VacancyNote> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return vacancyNoteRepository.findByVacancyIdOrderByCreatedAtDesc(vacancyId)
    }

    fun getNotesByType(vacancyId: Long, type: NoteType, userId: Long): List<VacancyNote> {
        val vacancy = vacancyRepository.findById(vacancyId)
            .orElseThrow { IllegalArgumentException("Vacancy not found") }

        // Verify that the vacancy belongs to the user
        if (vacancy.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        return vacancyNoteRepository.findByVacancyIdAndTypeOrderByCreatedAtDesc(vacancyId, type)
    }

    fun deleteNote(noteId: Long, userId: Long): Boolean {
        val note = vacancyNoteRepository.findById(noteId)
            .orElseThrow { IllegalArgumentException("Note not found") }

        // Verify that the note belongs to the user
        if (note.user.id != userId) {
            throw IllegalArgumentException("Access denied")
        }

        vacancyNoteRepository.delete(note)
        return true
    }
}