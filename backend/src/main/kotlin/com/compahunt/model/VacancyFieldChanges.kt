package com.compahunt.model

data class VacancyFieldChanges(
    val isJobRelated: Boolean = false,
    val changes: List<FieldChange> = listOf(),
    val interviewAssignment: Interview? = null
)

data class FieldChange(
    val fieldName: String,
    val oldValue: String?,
    val newValue: String?,
    val changeType: ChangeType
)

enum class ChangeType {
    UPDATED,
    ADDED,
    REMOVED
}