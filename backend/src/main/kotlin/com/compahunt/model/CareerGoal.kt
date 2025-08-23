package com.compahunt.model

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.util.*

@Entity
@Table(name = "career_goals")
data class CareerGoal(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    val userProfile: UserProfile,

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false)
    val goalType: GoalType,

    @NotBlank(message = "Goal title is required")
    @Size(max = 100, message = "Goal title must not exceed 100 characters")
    @Column(name = "title", nullable = false, length = 100)
    val title: String,

    @NotBlank(message = "Goal description is required")
    @Size(max = 500, message = "Goal description must not exceed 500 characters")
    @Column(name = "description", nullable = false, length = 500)
    val description: String,

    @Column(name = "target_date")
    val targetDate: LocalDate? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "progress_status", nullable = false)
    val progressStatus: ProgressStatus = ProgressStatus.NOT_STARTED,

    @Min(value = 0, message = "Progress percentage must be between 0 and 100")
    @Max(value = 100, message = "Progress percentage must be between 0 and 100")
    @Column(name = "progress_percentage")
    val progressPercentage: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    val priority: Priority? = null,

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column(name = "notes", length = 1000)
    val notes: String? = null
)

enum class GoalType {
    SHORT_TERM,    // < 1 year
    MEDIUM_TERM,   // 1-3 years
    LONG_TERM      // 3+ years
}

enum class ProgressStatus {
    NOT_STARTED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CANCELLED
}

enum class Priority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}