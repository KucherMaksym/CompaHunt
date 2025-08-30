package com.compahunt.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

@Service
class EncryptionService {

    @Value("\${app.encryption.key}")
    private lateinit var encryptionKey: String

    private val algorithm = "AES"

    fun hexStringToByteArray(string: String): ByteArray {
        return string.chunked(2).map { it.toInt(16).toByte() }.toByteArray();
    }

    fun encrypt(plainText: String): String {
        val key = SecretKeySpec(hexStringToByteArray(encryptionKey), algorithm)
        val cipher = Cipher.getInstance(algorithm)
        cipher.init(Cipher.ENCRYPT_MODE, key)
        val encryptedBytes = cipher.doFinal(plainText.toByteArray())
        return Base64.getEncoder().encodeToString(encryptedBytes)
    }

    fun decrypt(encryptedText: String): String {
        val key = SecretKeySpec(hexStringToByteArray(encryptionKey), algorithm)
        val cipher = Cipher.getInstance(algorithm)
        cipher.init(Cipher.DECRYPT_MODE, key)
        val decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText))
        return String(decryptedBytes)
    }
}