package com.compahunt.config

import com.pgvector.PGvector
import org.hibernate.engine.spi.SharedSessionContractImplementor
import org.hibernate.usertype.UserType
import java.io.Serializable
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.Types

class VectorType : UserType<PGvector> {

    override fun getSqlType(): Int = Types.OTHER

    override fun returnedClass(): Class<PGvector> = PGvector::class.java

    override fun equals(x: PGvector?, y: PGvector?): Boolean {
        if (x === y) return true
        if (x == null || y == null) return false
        return x.toArray().contentEquals(y.toArray())
    }

    override fun hashCode(x: PGvector?): Int {
        return x?.toArray()?.contentHashCode() ?: 0
    }

    override fun nullSafeGet(
        rs: ResultSet,
        position: Int,
        session: SharedSessionContractImplementor?,
        owner: Any?
    ): PGvector? {
        val value = rs.getObject(position) ?: return null
        return PGvector(value as String)
    }

    override fun nullSafeSet(
        st: PreparedStatement,
        value: PGvector?,
        index: Int,
        session: SharedSessionContractImplementor?
    ) {
        if (value == null) {
            st.setNull(index, Types.OTHER)
        } else {
            val pgObject = org.postgresql.util.PGobject()
            pgObject.type = "vector"
            pgObject.value = value.toString()
            st.setObject(index, pgObject)
        }
    }

    override fun deepCopy(value: PGvector?): PGvector? {
        return value?.let { PGvector(it.toArray().clone()) }
    }

    override fun isMutable(): Boolean = false

    override fun disassemble(value: PGvector?): Serializable? {
        return value?.toArray()
    }

    override fun assemble(cached: Serializable?, owner: Any?): PGvector? {
        return (cached as? FloatArray)?.let { PGvector(it) }
    }
}