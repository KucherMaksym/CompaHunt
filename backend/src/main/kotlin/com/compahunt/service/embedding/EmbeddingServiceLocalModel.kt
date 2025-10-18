package com.compahunt.service.embedding

import com.compahunt.annotation.LocalModelEmbedding
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono

data class EmbedRequest(
    val text: String,
    val type: String = "passage" // "query" or "passage"
)

data class EmbedResponse(
    val embedding: List<Double>,
    val dimension: Int
)

data class BatchEmbedRequest(
    val texts: List<String>
)

data class BatchEmbedResponse(
    val embeddings: List<List<Double>>,
    val count: Int,
    val dimension: Int
)

@Service
@LocalModelEmbedding
class EmbeddingServiceLocalModel(
    private val webClient: WebClient
) : EmbeddingService {

    constructor() : this(
        WebClient.builder()
            .baseUrl("http://localhost:8000")
            .build()
    )

    override fun generateEmbedding(text: String): List<Float> {
        return generateEmbedding(text, "passage")
    }

    override fun generateBatchEmbeddings(texts: List<String>): List<List<Float>> {
        TODO("Not yet implemented")
    }

    fun generateEmbedding(text: String, type: String): List<Float> {
        val response = webClient
            .post()
            .uri("/embed")
            .bodyValue(EmbedRequest(text = text, type = type))
            .retrieve()
            .bodyToMono<EmbedResponse>()
            .block()
            ?: throw RuntimeException("Failed to get embedding from service")

        return response.embedding.map { it.toFloat() }
    }
}