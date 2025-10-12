package com.compahunt.service.embedding

import kotlin.math.sqrt

interface EmbeddingService {
    fun generateEmbedding(text: String): List<Float>

    fun cosineSimilarity(vec1: FloatArray, vec2: FloatArray): Double {
        require(vec1.size == vec2.size) { "Vectors must have the same dimension" }

        var dotProduct = 0.0
        var norm1 = 0.0
        var norm2 = 0.0

        for (i in vec1.indices) {
            dotProduct += vec1[i] * vec2[i]
            norm1 += vec1[i] * vec1[i]
            norm2 += vec2[i] * vec2[i]
        }

        return dotProduct / (sqrt(norm1) * sqrt(norm2))
    }
}