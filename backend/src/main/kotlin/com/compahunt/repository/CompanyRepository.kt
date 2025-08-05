package com.compahunt.repository

import com.compahunt.model.Company
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface CompanyRepository : JpaRepository<Company, Long> {

    fun findByName(name: String): Optional<Company>

    fun existsByName(name: String): Boolean
}