package com.compahunt.dto

import com.compahunt.model.InterviewStatus
import com.compahunt.model.InterviewType
import jakarta.validation.constraints.NotNull
import java.time.Instant

data class CreateInterviewRequest(
    @field:NotNull(message = "Vacancy ID is required")
    val vacancyId: Long,
    
    @field:NotNull(message = "Scheduled time is required")
    val scheduledAt: Instant,
    
    @field:NotNull(message = "Interview type is required")
    val type: InterviewType,
    
    val notes: String? = null,
    val duration: Int? = null,
    val meetingLink: String? = null,
    val location: String? = null,
    val interviewerName: String? = null,
    val interviewerEmail: String? = null
)

data class UpdateInterviewRequest(
    val scheduledAt: Instant? = null,
    val type: InterviewType? = null,
    val status: InterviewStatus? = null,
    val notes: String? = null,
    val feedback: String? = null,
    val duration: Int? = null,
    val meetingLink: String? = null,
    val location: String? = null,
    val interviewerName: String? = null,
    val interviewerEmail: String? = null
)

data class InterviewResponse(
    val id: Long,
    val vacancyId: Long,
    val vacancyTitle: String,
    val companyName: String,
    val scheduledAt: String,
    val type: InterviewType,
    val status: InterviewStatus,
    val notes: String?,
    val feedback: String?,
    val duration: Int?,
    val meetingLink: String?,
    val location: String?,
    val interviewerName: String?,
    val interviewerEmail: String?,
    val createdAt: String,
    val updatedAt: String
)

data class UserResponse(
    val id: Long,
    val email: String,
    val firstName: String?,
    val lastName: String?
)