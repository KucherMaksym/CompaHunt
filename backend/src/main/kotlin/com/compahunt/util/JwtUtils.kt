package com.compahunt.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("\${app.jwt.public-key}")
    private lateinit var publicKeyString: String;

    private fun getPublicKey(): PublicKey {
        val cleanKey = publicKeyString
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\n", "")
            .replace("\r", "")
            .replace(" ", "");

        val keyBytes = Base64.getDecoder().decode(cleanKey);
        val keySpec = X509EncodedKeySpec(keyBytes);
        val keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(keySpec);
    }

    fun validateToken(token: String): Boolean {
        println("token $token")
        return try {
            val publicKey = getPublicKey();

            val claims = Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .payload;

            val issuer = claims.issuer;
            val audience = claims.audience;

            if (issuer != "nextauth") {
                println("Invalid issuer: $issuer");
                return false;
            }

            if (!audience.contains("compahunt-api")) {
                println("Invalid audience: $audience");
                return false;
            }

            // expiration
            val expiration = claims.expiration;
            if (expiration.before(Date())) {
                println("Token expired: $expiration");
                return false;
            }

            println("Token validation successful");
            true;
        } catch (ex: Exception) {
            println("Token validation failed: ${ex.message}");
            false;
        }
    }

    fun getUserIdFromToken(token: String): Long {
        val publicKey = getPublicKey();

        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .payload;

        return claims.subject.toLong();
    }

    fun getEmailFromToken(token: String): String {
        val publicKey = getPublicKey();

        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .payload;

        return claims.get("email", String::class.java);
    }

    fun getNameFromToken(token: String): String {
        val publicKey = getPublicKey();

        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .payload;

        return claims.get("name", String::class.java);
    }

    fun getProviderFromToken(token: String): String {
        val publicKey = getPublicKey();

        val claims = Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .payload;

        return claims.get("provider", String::class.java) ?: "unknown";
    }

    fun getAllClaimsFromToken(token: String): Claims {
        val publicKey = getPublicKey();

        return Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .payload;
    }
}