package com.compahunt.dto

import java.util.UUID

data class CreateVacancyNoteRequest(
    val vacancyId: UUID?,
    val content: String,
    val type: String,
    val priority: String = "MEDIUM",
    val tags: String? = null,
    val isPrivate: Boolean = false
)

data class CreateInterviewNoteRequest(
    val interviewId: UUID?,
    val content: String,
    val type: String,
    val priority: String = "MEDIUM",
    val tags: String? = null,
    val isPrivate: Boolean = false
)

data class CreateNoteRequest(
    val content: String,
    val type: String,
    val vacancyId: UUID?,
    val priority: String,
    val tags: String,
    val isPrivate: Boolean
)

data class UpdateNoteRequest(
    val content: String? = null,
    val type: String? = null,
    val priority: String? = null,
    val tags: String? = null,
    val isPrivate: Boolean? = null
)

data class VacancyNoteResponse(
    val id: UUID?,
    val content: String,
    val type: String,
    val priority: String,
    val tags: String?,
    val isPrivate: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class InterviewNoteResponse(
    val id: UUID?,
    val content: String,
    val type: String,
    val priority: String,
    val tags: String?,
    val isPrivate: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class NoteSearchRequest(
    val query: String? = null,
    val type: String? = null,
    val priority: String? = null,
    val tags: String? = null,
    val isPrivate: Boolean? = null,
    val fromDate: String? = null,
    val toDate: String? = null,
    val page: Int = 0,
    val size: Int = 20,
    val sortBy: String = "createdAt",
    val sortDirection: String = "desc"
)