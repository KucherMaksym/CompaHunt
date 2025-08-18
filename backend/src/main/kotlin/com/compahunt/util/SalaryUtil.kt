package com.compahunt.util

import com.compahunt.model.Salary
import java.math.BigDecimal
import java.math.RoundingMode

fun formatSalaryToString(salary: Salary?): String {
    if (salary == null) return ""

    val currency = salary.currency?.takeIf { it.isNotBlank() } ?: "USD"
    val period = salary.period?.takeIf { it.isNotBlank() } ?: "year"

    return when {
        // Both min and max
        salary.min != null && salary.max != null -> {
            val minFormatted = formatAmount(salary.min!!)
            val maxFormatted = formatAmount(salary.max!!)
            "$currency/$minFormatted-$maxFormatted/$period"
        }

        // Only minimum
        salary.min != null -> {
            val minFormatted = formatAmount(salary.min!!)
            "$currency/from $minFormatted/$period"
        }

        // Only maximum
        salary.max != null -> {
            val maxFormatted = formatAmount(salary.max!!)
            "$currency/up to $maxFormatted/$period"
        }

        // No amounts
        else -> "$currency/negotiable/$period"
    }
}

private fun formatAmount(amount: BigDecimal): String {
    return when {
        amount >= BigDecimal(1_000_000) -> {
            val millions = amount.divide(BigDecimal(1_000_000), 3, RoundingMode.HALF_UP)
            "${millions.stripTrailingZeros().toPlainString()}M"
        }
        amount >= BigDecimal(1_000) -> {
            val thousands = amount.divide(BigDecimal(1_000), 1, RoundingMode.HALF_UP)
            "${thousands.stripTrailingZeros().toPlainString()}K"
        }
        else -> amount.stripTrailingZeros().toPlainString()
    }
}