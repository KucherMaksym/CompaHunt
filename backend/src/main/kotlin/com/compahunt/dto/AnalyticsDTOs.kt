package com.compahunt.dto

import com.compahunt.model.VacancyStatus
import java.math.BigDecimal

data class AnalyticsDataDTO(
    val statusDistribution: List<StatusDistributionDTO>,
    val monthlyTrends: List<MonthlyTrendsDTO>,
    val salaryDistribution: List<SalaryDistributionDTO>,
    val remoteWorkDistribution: List<RemoteWorkDistributionDTO>,
    val topCompanies: List<TopCompaniesDTO>,
    val responseTimeData: List<ResponseTimeDTO>,
    val interviewTypes: List<InterviewTypeDTO>
)

data class StatusDistributionDTO(
    val status: VacancyStatus,
    val label: String,
    val count: Long
)

data class MonthlyTrendsDTO(
    val month: String,
    val applied: Long,
    val interviews: Long,
    val offers: Long
)

data class SalaryDistributionDTO(
    val range: String,
    val count: Long,
    val avg: BigDecimal
)

data class RemoteWorkDistributionDTO(
    val type: String,
    val label: String,
    val count: Long,
    val percentage: Double
)

data class TopCompaniesDTO(
    val company: String,
    val applications: Long,
    val interviews: Long,
    val successRate: Double
)

data class ResponseTimeDTO(
    val name: String,
    val value: Long
)

data class InterviewTypeDTO(
    val type: String,
    val label: String,
    val count: Long,
    val successRate: Double
)