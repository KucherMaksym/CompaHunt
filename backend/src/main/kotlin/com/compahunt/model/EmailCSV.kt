package com.compahunt.model

import com.opencsv.bean.CsvBindByName

data class EmailCSV(
    @CsvBindByName(column = "Text")
    val body: String = "",

    @CsvBindByName(column = "Subject")
    val subject: String = "",
)