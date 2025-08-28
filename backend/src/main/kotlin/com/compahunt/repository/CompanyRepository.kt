package com.compahunt.repository

import com.compahunt.model.Company
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface CompanyRepository : JpaRepository<Company, UUID> {

    fun findByName(name: String): Company?

    fun existsByName(name: String): Boolean
}