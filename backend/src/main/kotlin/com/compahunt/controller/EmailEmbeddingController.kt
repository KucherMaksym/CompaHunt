package com.compahunt.controller

import com.compahunt.annotation.LogExecutionTime
import com.compahunt.model.EmailCSV
import com.compahunt.model.EmailEmbedding
import com.compahunt.service.EmailEmbeddingService
import com.compahunt.service.EmailReaderService
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping

@RequestMapping("/api/emails/embedding")
@Controller
class EmailEmbeddingController(
    val emailEmbeddingService: EmailEmbeddingService,
    val emailReaderService: EmailReaderService
) {

    @PostMapping("/{file}")
    fun getEmailData(@PathVariable file:  String): ResponseEntity<List<EmailCSV>> {
        val emails = emailReaderService.getEmailsFromCsv(file);
        return ResponseEntity.ok(emails)
    }

    @PostMapping("/{file}/clean")
    @LogExecutionTime
    fun getCleanEmailData(@PathVariable file:  String): ResponseEntity<List<EmailCSV>> {
        val emails = emailReaderService.getCleanEmailsFromCsv(file);
        return ResponseEntity.ok(emails)
    }

    @PostMapping("/{file}/generate-batch-embeddings")
    @LogExecutionTime
    fun generateEmbeddingsFromEmailData(@PathVariable file:  String): ResponseEntity<List<EmailEmbedding>> {
        val emails = emailReaderService.getCleanEmailsFromCsv(file);
        val embeddings = emailEmbeddingService.generateAndSaveBatchEmbedding(emails)
        return ResponseEntity.ok(embeddings)
    }

}