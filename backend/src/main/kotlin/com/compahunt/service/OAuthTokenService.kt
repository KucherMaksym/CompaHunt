package com.compahunt.service

import com.compahunt.model.UserOAuthToken
import com.compahunt.repository.UserOAuthTokenRepository
import com.compahunt.repository.UserRepository
import com.google.api.client.auth.oauth2.RefreshTokenRequest
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*

@Service
class OAuthTokenService(
    private val tokenRepository: UserOAuthTokenRepository,
    private val userRepository: UserRepository,
) {

    private val log = LoggerFactory.getLogger(OAuthTokenService::class.java)

    @Value("\${spring.security.oauth2.client.registration.google.client-id}")
    private lateinit var googleClientId: String

    @Value("\${spring.security.oauth2.client.registration.google.client-secret}")
    private lateinit var googleClientSecret: String

    @Transactional
    fun saveGmailToken(
        userId: UUID,
        accessToken: String,
        refreshToken: String?,
        expiresIn: Long
    ) {
        val expiresAt = Instant.now().plusSeconds(expiresIn)
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }

        val existingToken = tokenRepository.findByUserIdAndProvider(userId, "google")
        if (existingToken != null) {
            tokenRepository.delete(existingToken)
            tokenRepository.flush()
        }

        val newToken = UserOAuthToken(
            user = user,
            provider = "google",
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresAt = expiresAt,
            scopes = "https://www.googleapis.com/auth/gmail.readonly"
        )
        tokenRepository.save(newToken)
        log.info("Saved Gmail token for user: $userId")
    }

    fun getValidGmailToken(userId: UUID): String? {
        val token = tokenRepository.findByUserIdAndProvider(userId, "google")
            ?: return null

        return if (token.isExpired()) {
            refreshGmailToken(token)
        } else {
            token.accessToken
        }
    }

    private fun refreshGmailToken(token: UserOAuthToken): String? {
        if (token.refreshToken == null) {
            log.error("No refresh token available for user: ${token.user.id}")
            return null
        }

        return try {
            val transport = NetHttpTransport()
            val jsonFactory = GsonFactory.getDefaultInstance()

            val refreshRequest = RefreshTokenRequest(
                transport, jsonFactory,
                com.google.api.client.http.GenericUrl("https://oauth2.googleapis.com/token"),
                token.refreshToken
            ).setClientAuthentication(
                com.google.api.client.auth.oauth2.ClientParametersAuthentication(
                    googleClientId, googleClientSecret
                )
            )

            val response = refreshRequest.execute()
            val newAccessToken = response.accessToken
            val expiresIn = response.expiresInSeconds ?: 3600L

            saveGmailToken(token.user.id, newAccessToken, token.refreshToken, expiresIn)

            log.info("Refreshed Gmail token for user: ${token.user.id}")
            newAccessToken
        } catch (e: Exception) {
            log.error("Failed to refresh Gmail token for user: ${token.user.id}", e)
            null
        }
    }

    fun hasGmailAccess(userId: UUID): Boolean {
        return tokenRepository.findByUserIdAndProvider(userId, "google") != null
    }

    fun revokeGmailAccess(userId: UUID) {
        tokenRepository.deleteByUserIdAndProvider(userId, "google")
        log.info("Revoked Gmail access for user: $userId")
    }
}