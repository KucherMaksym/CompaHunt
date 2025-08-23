package com.compahunt.util

import com.compahunt.model.UserPrincipal
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

object AuthenticationUtils {
    
    fun getUserPrincipal(authentication: Authentication): UserPrincipal {
        return when (val principal = authentication.principal) {
            is UserPrincipal -> principal
            else -> throw IllegalStateException("Authentication principal is not of type UserPrincipal")
        }
    }
    
    fun getCurrentUserPrincipal(): UserPrincipal? {
        val authentication = SecurityContextHolder.getContext().authentication
        return if (authentication != null && authentication.isAuthenticated) {
            try {
                getUserPrincipal(authentication)
            } catch (e: IllegalStateException) {
                null
            }
        } else {
            null
        }
    }
    
    fun getUserId(authentication: Authentication): Long {
        return getUserPrincipal(authentication).id
    }
    
    fun getCurrentUserId(): Long? {
        return getCurrentUserPrincipal()?.id
    }
    
    fun getUserEmail(authentication: Authentication): String {
        return getUserPrincipal(authentication).email
    }
    
    fun getCurrentUserEmail(): String? {
        return getCurrentUserPrincipal()?.email
    }

    fun hasRole(role: String): Boolean {
        val userPrincipal = getCurrentUserPrincipal() ?: return false
        return userPrincipal.authorities.any { 
            it.authority == "ROLE_$role" || it.authority == role 
        }
    }
    
    fun isAdmin(): Boolean {
        return hasRole("ADMIN")
    }
}