package com.compahunt.component

import com.compahunt.service.EncryptionService
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
@Converter(autoApply = false)
class EncryptedStringConverter : AttributeConverter<String?, String?> {

    @Autowired
    private lateinit var encryptionService: EncryptionService

    override fun convertToDatabaseColumn(attribute: String?): String? {
        return attribute?.let { encryptionService.encrypt(it) }
    }

    override fun convertToEntityAttribute(dbData: String?): String? {
        return dbData?.let { encryptionService.decrypt(it) }
    }
}