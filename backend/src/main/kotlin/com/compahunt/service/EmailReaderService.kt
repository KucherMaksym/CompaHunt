package com.compahunt.service

import com.compahunt.model.EmailCSV
import com.opencsv.bean.CsvToBeanBuilder
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.File

@Service
class EmailReaderService(
    val emailCleaningService: EmailCleaningService
){

    private val log = LoggerFactory.getLogger(EmailReaderService::class.java)

    fun getEmailsFromCsv(csvFile: String): List<EmailCSV> {
        val file = File("../datasets/$csvFile")

        log.info("Trying to read file: ${file.canonicalPath}")

        if (!file.exists() || !file.isFile) {
            log.error("File does not exist or is not a file: ${file.canonicalPath}")
            throw IllegalArgumentException("File does not exist or is not a file: ${file.canonicalPath}")
        }

         return try {
            val emails = file.reader().use { reader ->
                val csvReader = CsvToBeanBuilder<EmailCSV>(reader)
                    .withType(EmailCSV::class.java)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build()

                csvReader.parse()
//                    .also { emails ->
//                    log.info("Successfully parsed ${emails.size} emails")
//                    emails.forEach { println(it) }
                }
//            }

//            // TODO: replace
            val firstMail = emails[0];
             listOf<EmailCSV>(firstMail);
        } catch (e: Exception) {
            log.error("Error reading CSV file: ${file.canonicalPath}", e)
             emptyList()
        }
    }

    fun getCleanEmailsFromCsv(csvFile: String): List<EmailCSV> {
        val emails = getEmailsFromCsv(csvFile)
        return emails.map { email ->
            val cleanedBody = emailCleaningService.cleanEmailBody(email.body)
            email.copy(body = cleanedBody)
        }
    }
}