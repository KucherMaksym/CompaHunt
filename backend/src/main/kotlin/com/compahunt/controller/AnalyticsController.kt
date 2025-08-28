package com.compahunt.controller

import com.compahunt.annotation.CurrentUser
import com.compahunt.dto.AnalyticsDataDTO
import com.compahunt.model.UserPrincipal
import com.compahunt.service.AnalyticsService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/analytics")
class AnalyticsController(
    private val analyticsService: AnalyticsService
) {

    @GetMapping
    fun getAnalyticsData(@CurrentUser currentUser: UserPrincipal): ResponseEntity<AnalyticsDataDTO> {
        val analyticsData = analyticsService.getAnalyticsData(currentUser.id)
        return ResponseEntity.ok(analyticsData)
    }
}