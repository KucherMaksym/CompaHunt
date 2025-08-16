package com.compahunt.exception

class VacancyNotFoundException(message: String) : RuntimeException(message)
class DuplicateVacancyException(message: String) : RuntimeException(message)
class UnauthorizedException(message: String) : RuntimeException(message)
class InvalidVacancyDataException(message: String) : RuntimeException(message)