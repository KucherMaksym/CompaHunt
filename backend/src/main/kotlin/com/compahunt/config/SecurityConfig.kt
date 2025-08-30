package com.compahunt.config

import com.compahunt.component.JwtAuthenticationFilter
//import com.compahunt.component.RestAuthenticationEntryPoint
import com.compahunt.repository.UserRepository
import com.compahunt.util.JwtUtils
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtUtils: JwtUtils,
    private val userRepository: UserRepository
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun jwtAuthenticationFilter(): JwtAuthenticationFilter {
        return JwtAuthenticationFilter(jwtUtils, userRepository)
    }

//    @Bean
//    fun restAuthenticationEntryPoint(): RestAuthenticationEntryPoint {
//        return RestAuthenticationEntryPoint()
//    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
//        configuration.allowedOriginPatterns = listOf("http://localhost:3000", "https://linkedin.com", "https://www.linkedin.com")
        configuration.allowedOriginPatterns = listOf("*")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/validate-credentials",
                        "/api/auth/sync-google-user",
                        "/api/gmail/webhook/**",
                        "/api/auth/health",
                        "/actuator/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                    ).permitAll()

                    .anyRequest().authenticated()
            }
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}