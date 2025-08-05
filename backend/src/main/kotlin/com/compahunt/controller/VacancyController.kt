package com.compahunt.controller

import com.compahunt.dto.CreateVacancyRequest
import com.compahunt.dto.VacancyResponse
import com.compahunt.model.Salary
import com.compahunt.service.VacancyService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/vacancies")
@CrossOrigin(origins = ["*"])
class VacancyController(
    private val vacancyService: VacancyService
) {

    @GetMapping
    fun getApplications(): ResponseEntity<List<VacancyResponse>> {
        val vacancies = vacancyService.getAllVacancies()
        return ResponseEntity.ok(vacancies)
    }

    @PostMapping
    fun createApplication(@RequestBody jobData: Map<String, Any?>): ResponseEntity<Map<String, Any>> {
        return try {
            val request = CreateVacancyRequest(
                title = jobData["title"] as String,
                company = jobData["company"] as String,
                location = jobData["location"] as String,
                jobType = jobData["jobType"] as? String,
                experienceLevel = jobData["experienceLevel"] as? String,
                description = jobData["description"] as String,
                requirements = (jobData["requirements"] as? List<*>)?.filterIsInstance<String>() ?: listOf(),
                skills = (jobData["skills"] as? List<*>)?.filterIsInstance<String>() ?: listOf(),
                postedDate = jobData["postedDate"] as? String,
                applicantCount = (jobData["applicantCount"] as? Number)?.toInt(),
                url = jobData["url"] as String,
                salary = jobData["salary"]?.let { salaryData ->
                    val salaryMap = salaryData as Map<String, String>
                    Salary(
                        range = salaryMap["range"] ?: "",
                        currency = salaryMap["currency"] ?: "",
                        period = salaryMap["period"] ?: "",
                        type = salaryMap["type"] ?: "",
                        location = salaryMap["location"] ?: ""
                    )
                },
                remoteness = jobData["remoteness"] as? String,
                industry = jobData["industry"] as? String
            )

            val vacancy = vacancyService.createVacancy(request)
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                "success" to true,
                "message" to "Application saved successfully",
                "id" to vacancy.id,
                "vacancy" to vacancy
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message,
                "error" to "DUPLICATE_URL"
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Failed to save application",
                "error" to e.message
            ))
        } as ResponseEntity<Map<String, Any>>
    }

    @GetMapping("/{id}")
    fun getApplication(@PathVariable id: Long): ResponseEntity<VacancyResponse> {
        return try {
            val vacancy = vacancyService.getVacancy(id)
            ResponseEntity.ok(vacancy)
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    fun archiveApplication(
        @PathVariable id: Long,
        @RequestParam(required = false) reason: String?
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val success = vacancyService.archiveVacancy(id, reason ?: "Archived from extension")
            if (success) {
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "message" to "Application archived successfully"
                ))
            } else {
                ResponseEntity.badRequest().body(mapOf(
                    "success" to false,
                    "message" to "Failed to archive application"
                ))
            }
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } as ResponseEntity<Map<String, Any>>
    }
}