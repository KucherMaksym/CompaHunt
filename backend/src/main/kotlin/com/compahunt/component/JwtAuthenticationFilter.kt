package com.compahunt.component

import com.compahunt.model.User
import com.compahunt.model.UserPrincipal
import com.compahunt.repository.UserRepository
import com.compahunt.util.JwtUtils
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthenticationFilter(
    private val jwtUtils: JwtUtils,
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {

            val jwt = getJwtFromRequest(request)

            if (jwt != null && jwtUtils.validateToken(jwt)) {

                val userId = jwtUtils.getUserIdFromToken(jwt)
                val email = jwtUtils.getEmailFromToken(jwt)
                val name = jwtUtils.getNameFromToken(jwt)


                val user = userRepository.findById(userId).orElse(null)

                val userPrincipal = if (user != null) {
                    UserPrincipal.create(user)
                } else {

                    UserPrincipal(
                        id = userId,
                        email = email,
                        name = name,
                        authorities = emptyList()
                    )
//                        .apply { this.name = name }
                }

                val authentication = UsernamePasswordAuthenticationToken(
                    userPrincipal, null, userPrincipal.authorities
                )
                SecurityContextHolder.getContext().authentication = authentication

            } else {
                log.error("JWT validation failed")
                if (jwt != null) {
                    try {
                        val claims = jwtUtils.getAllClaimsFromToken(jwt)
                    } catch (e: Exception) {
                    }
                }
            }
        } catch (ex: Exception) {
            log.error("JWT Filter Exception: ${ex.message}")
            ex.printStackTrace()
            logger.error("Could not set user authentication in security context", ex)
        }

        filterChain.doFilter(request, response)
    }

    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken?.startsWith("Bearer ") == true) {
            bearerToken.substring(7)
        } else null
    }
}