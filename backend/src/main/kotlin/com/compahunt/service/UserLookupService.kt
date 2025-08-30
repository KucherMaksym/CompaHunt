package com.compahunt.service

import com.compahunt.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class UserLookupService(
    private val userRepository: UserRepository
) {

    fun findUserIdByEmail(email: String): UUID? {
        return userRepository.findByEmail(email)?.id
    }

    fun isValidUser(userId: UUID): Boolean {
        return userRepository.existsById(userId)
    }
}