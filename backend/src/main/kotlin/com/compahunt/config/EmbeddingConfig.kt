package com.compahunt.config

import org.springframework.ai.document.MetadataMode
import org.springframework.ai.openai.OpenAiEmbeddingModel
import org.springframework.ai.openai.OpenAiEmbeddingOptions
import org.springframework.ai.openai.api.OpenAiApi
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class EmbeddingConfig {
    @Bean
    fun openAiApi(@Value("\${spring.ai.openai.api-key}") apiKey: String?): OpenAiApi? {
        return OpenAiApi.builder()
            .apiKey(apiKey)
            .build()
    }

    @Bean
    fun openAiEmbeddingModel(openAiApi: OpenAiApi?): OpenAiEmbeddingModel {
        val options = OpenAiEmbeddingOptions.builder()
            .model("text-embedding-3-small")
            .build()
        return OpenAiEmbeddingModel(openAiApi, MetadataMode.EMBED, options)
    }
}