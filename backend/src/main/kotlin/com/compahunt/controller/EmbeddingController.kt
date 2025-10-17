package com.compahunt.controller

import com.compahunt.annotation.LocalModelEmbedding
import com.compahunt.annotation.OpenAIEmbedding
import com.compahunt.service.embedding.EmbeddingService
import com.compahunt.service.embedding.EmbeddingServiceOpenAI
import org.springframework.ai.embedding.EmbeddingResponse
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class EmbeddingController(
    @OpenAIEmbedding val embeddingService: EmbeddingService
) {
    @PostMapping("/embeddings")
    fun getEmbeddings(@RequestBody text: String): ResponseEntity<Any?> {
        val response = embeddingService.generateEmbedding(text)
        return ResponseEntity.ok(response)
    }
}