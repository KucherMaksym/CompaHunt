package com.compahunt.service

import com.compahunt.model.EmailEmbedding
import com.compahunt.repository.EmailEmbeddingRepository
import org.springframework.stereotype.Service

@Service
class EmailEmbeddingService(
    val emailEmbeddingRepository: EmailEmbeddingRepository
) {

//    fun generateEmbedding(email: EmailData): EmailEmbedding {
//
//        return EmailEmbedding(
//            id = 0,
//            body = email.body,
//            subject = email.subject,
//            embedding = FloatArray(1536) { 0.0f } // Placeholder for actual embedding generation
//        )
//    }

}