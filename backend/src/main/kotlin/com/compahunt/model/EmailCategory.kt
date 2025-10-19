package com.compahunt.model

enum class EmailCategory {
    // Job-related categories
    JOB_RELATED_ACCEPTED,
    JOB_RELATED_REJECTED,
    JOB_RELATED_INTERVIEW,
    JOB_RELATED_OTHER,

    // Non-job-related categories
    NOT_JOB_RELATED_SPAM,
    NOT_JOB_RELATED_OTHER;

    companion object {
        fun fromString(status: String?): EmailCategory {
            if (status.isNullOrBlank()) {
                return JOB_RELATED_OTHER
            }

            return when (status.lowercase().trim()) {
                "accept", "accepted", "job_related_accepted" -> JOB_RELATED_ACCEPTED
                "reject", "rejected", "job_related_rejected" -> JOB_RELATED_REJECTED
                "interview", "job_related_interview" -> JOB_RELATED_INTERVIEW
                "spam", "not_job_related_spam" -> NOT_JOB_RELATED_SPAM
                "not_job_related", "not_job_related_other" -> NOT_JOB_RELATED_OTHER
                else -> JOB_RELATED_OTHER
            }
        }
    }
}