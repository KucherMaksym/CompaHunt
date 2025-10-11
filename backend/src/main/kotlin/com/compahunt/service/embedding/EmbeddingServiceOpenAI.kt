package com.compahunt.service.embedding

import com.compahunt.annotation.OpenAIEmbedding
import org.springframework.ai.embedding.EmbeddingOptionsBuilder
import org.springframework.ai.embedding.EmbeddingRequest
import org.springframework.ai.embedding.EmbeddingResponse
import org.springframework.ai.openai.OpenAiEmbeddingModel
import org.springframework.stereotype.Service

// DON'T USE THIS SERVICE. For unknown reasons, the OpenAI API returns 429 even when there are sufficient
// credits. Most likely, the error is on OpenAI's side. Use EmbeddingServiceLocalModel instead.
@Service
@OpenAIEmbedding
class EmbeddingServiceOpenAI(
    val embeddingModel: OpenAiEmbeddingModel
): EmbeddingService {

    override fun generateEmbedding(text: String): List<Float> {

        val embeddingOptions = EmbeddingOptionsBuilder.builder().withModel("text-embedding-3-small").build()

        val request: EmbeddingRequest = EmbeddingRequest(listOf(text), embeddingOptions)
        val response = embeddingModel.call(request)

        val result = response.result.output;
        return result.toList();
    }
}