package com.compahunt.service

import com.compahunt.dto.*
import com.compahunt.model.VacancyStatus
import com.compahunt.repository.VacancyRepository
import com.compahunt.repository.InterviewRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.TextStyle
import java.util.*

@Service
class AnalyticsService(
    private val vacancyRepository: VacancyRepository,
    private val interviewRepository: InterviewRepository
) {

    fun getAnalyticsData(userId: UUID): AnalyticsDataDTO {
        val vacancies = vacancyRepository.findByUserIdOrderByCreatedAtDesc(userId)
        val interviews = interviewRepository.findByUserIdOrderByScheduledAtAsc(userId)
        
        return AnalyticsDataDTO(
            statusDistribution = getStatusDistribution(vacancies),
            monthlyTrends = getMonthlyTrends(vacancies, interviews),
            salaryDistribution = getSalaryDistribution(vacancies),
            remoteWorkDistribution = getRemoteWorkDistribution(vacancies),
            topCompanies = getTopCompanies(vacancies, interviews),
            responseTimeData = getResponseTimeData(vacancies),
            interviewTypes = getInterviewTypes(interviews)
        )
    }

    private fun getStatusDistribution(vacancies: List<com.compahunt.model.Vacancy>): List<StatusDistributionDTO> {
        val statusCounts = vacancies.groupBy { it.status }
            .mapValues { it.value.size.toLong() }

        return VacancyStatus.values().map { status ->
            val label = when (status) {
                VacancyStatus.APPLIED -> "Applied"
                VacancyStatus.WISHLIST -> "Wishlist"
                VacancyStatus.PHONE_SCREEN -> "Phone Screen"
                VacancyStatus.INTERVIEW -> "Interview"
                VacancyStatus.OFFER -> "Offer"
                VacancyStatus.REJECTED -> "Rejected"
                VacancyStatus.ARCHIVED -> "Archived"
            }
            
            StatusDistributionDTO(
                status = status,
                label = label,
                count = statusCounts[status] ?: 0L
            )
        }.filter { it.count > 0 }
    }

    private fun getMonthlyTrends(
        vacancies: List<com.compahunt.model.Vacancy>,
        interviews: List<com.compahunt.model.Interview>
    ): List<MonthlyTrendsDTO> {
        val now = LocalDate.now()
        val months = (0..5).map { now.minusMonths(it.toLong()) }.reversed()

        return months.map { month ->
            val monthStart = month.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
            val monthEnd = month.withDayOfMonth(month.lengthOfMonth()).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant()

            val applied = vacancies.count { 
                it.appliedAt >= monthStart && it.appliedAt <= monthEnd 
            }.toLong()

            val interviewsCount = interviews.count { 
                it.scheduledAt >= monthStart && it.scheduledAt <= monthEnd 
            }.toLong()

            val offers = vacancies.count { 
                it.status == VacancyStatus.OFFER && 
                it.updatedAt >= monthStart && it.updatedAt <= monthEnd 
            }.toLong()

            MonthlyTrendsDTO(
                month = month.month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                applied = applied,
                interviews = interviewsCount,
                offers = offers
            )
        }
    }

    private fun getSalaryDistribution(vacancies: List<com.compahunt.model.Vacancy>): List<SalaryDistributionDTO> {
        val vacanciesWithSalary = vacancies.filter { it.salary?.monthMax != null }
        
        val salaryRanges = listOf(
            "50-80k" to (50000..80000),
            "80-120k" to (80001..120000),
            "120-160k" to (120001..160000),
            "160-200k" to (160001..200000),
            "200k+" to (200001..Int.MAX_VALUE)
        )

        return salaryRanges.map { (range, salaryRange) ->
            val vacanciesInRange = vacanciesWithSalary.filter { vacancy ->
                val maxSalary = vacancy.salary?.monthMax?.multiply(BigDecimal(12))?.toInt() ?: 0
                maxSalary in salaryRange
            }
            
            val avgSalary = if (vacanciesInRange.isNotEmpty()) {
                vacanciesInRange.map { 
                    it.salary?.monthMax?.multiply(BigDecimal(12)) ?: BigDecimal.ZERO
                }.fold(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal(vacanciesInRange.size), RoundingMode.HALF_UP)
                    .divide(BigDecimal(1000), RoundingMode.HALF_UP) // Convert to thousands
            } else {
                BigDecimal.ZERO
            }

            SalaryDistributionDTO(
                range = range,
                count = vacanciesInRange.size.toLong(),
                avg = avgSalary
            )
        }.filter { it.count > 0 }
    }

    private fun getRemoteWorkDistribution(vacancies: List<com.compahunt.model.Vacancy>): List<RemoteWorkDistributionDTO> {
        val totalCount = vacancies.size.toDouble()
        
        val remoteCounts = vacancies.groupBy { vacancy ->
            when (vacancy.remoteness?.lowercase()) {
                "remote", "fully remote" -> "Remote"
                "hybrid", "mixed" -> "Hybrid"
                else -> "On-site"
            }
        }.mapValues { it.value.size }

        return remoteCounts.map { (type, count) ->
            RemoteWorkDistributionDTO(
                type = type,
                label = type,
                count = count.toLong(),
                percentage = if (totalCount > 0) (count / totalCount * 100).let { 
                    BigDecimal(it).setScale(1, RoundingMode.HALF_UP).toDouble()
                } else 0.0
            )
        }.sortedByDescending { it.count }
    }

    private fun getTopCompanies(
        vacancies: List<com.compahunt.model.Vacancy>,
        interviews: List<com.compahunt.model.Interview>
    ): List<TopCompaniesDTO> {
        val companyStats = vacancies.groupBy { it.company.name }
            .map { (companyName, companyVacancies) ->
                val applications = companyVacancies.size.toLong()
                val interviewsForCompany = interviews.count { interview ->
                    companyVacancies.any { it.id == interview.vacancy.id }
                }.toLong()
                
                val successRate = if (applications > 0) {
                    (interviewsForCompany.toDouble() / applications.toDouble() * 100)
                        .let { BigDecimal(it).setScale(0, RoundingMode.HALF_UP).toDouble() }
                } else 0.0

                TopCompaniesDTO(
                    company = companyName,
                    applications = applications,
                    interviews = interviewsForCompany,
                    successRate = successRate
                )
            }
            .sortedByDescending { it.applications }
            .take(5)

        return companyStats
    }

    private fun getResponseTimeData(vacancies: List<com.compahunt.model.Vacancy>): List<ResponseTimeDTO> {
        // This is a simplified version - in a real app you'd track when status changes occur
        val totalVacancies = vacancies.size.toLong()
        
        return listOf(
            ResponseTimeDTO("0-3 days", (totalVacancies * 0.45).toLong()),
            ResponseTimeDTO("3-7 days", (totalVacancies * 0.30).toLong()),
            ResponseTimeDTO("7-14 days", (totalVacancies * 0.15).toLong()),
            ResponseTimeDTO("14+ days", (totalVacancies * 0.10).toLong())
        )
    }

    private fun getInterviewTypes(interviews: List<com.compahunt.model.Interview>): List<InterviewTypeDTO> {
        val typeMapping = mapOf(
            com.compahunt.model.InterviewType.PHONE_SCREEN to "Phone Screen",
            com.compahunt.model.InterviewType.TECHNICAL to "Technical", 
            com.compahunt.model.InterviewType.BEHAVIORAL to "Behavioral",
            com.compahunt.model.InterviewType.FINAL_ROUND to "Final Round"
        )

        val interviewStats = interviews.groupBy { it.type }
            .mapValues { (_, typeInterviews) ->
                val total = typeInterviews.size
                val successful = typeInterviews.count { it.status == com.compahunt.model.InterviewStatus.COMPLETED }
                val successRate = if (total > 0) (successful.toDouble() / total.toDouble() * 100) else 0.0
                
                Pair(total.toLong(), successRate)
            }

        return typeMapping.map { (key, label) ->
            val (count, successRate) = interviewStats[key] ?: Pair(0L, 0.0)
            InterviewTypeDTO(
                type = key.name,
                label = label,
                count = count,
                successRate = BigDecimal(successRate).setScale(0, RoundingMode.HALF_UP).toDouble()
            )
        }.filter { it.count > 0 }
    }
}