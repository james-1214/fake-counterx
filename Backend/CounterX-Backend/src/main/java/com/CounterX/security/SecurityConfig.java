package com.CounterX.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // ── CORS: tell Spring Security to delegate CORS decisions
                // to the CorsFilter bean defined in CorsConfig.
                // Without this line the CorsFilter bean runs AFTER Security's
                // chain and browser OPTIONS preflight requests are blocked.
                .cors(cors -> {})   // ← the key fix for CORS on protected routes

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ── Always allow OPTIONS preflight ──────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Login & Register
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register"
                        ).permitAll()

                        // ================= MENU =================

                        // Customer Access (no auth needed to browse menu)
                        .requestMatchers(HttpMethod.GET, "/api/menu/**")
                        .permitAll()

                        // Admin Only
                        .requestMatchers(HttpMethod.POST, "/api/menu/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/menu/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/menu/**")
                        .hasRole("ADMIN")

                        // ================== Inventory ============

                        .requestMatchers("/api/inventory/**", "/api/dashboard/inventory/**")
                        .hasRole("ADMIN")

                        // ================= ADMIN DASHBOARD =================

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // ================= DASHBOARD =================

                        .requestMatchers("/api/dashboard/**")
                        .hasRole("ADMIN")

                        // ================= SALES =================

                        .requestMatchers("/api/sales/**")
                        .hasRole("ADMIN")

                        // ================= KITCHEN =================

                        .requestMatchers("/api/kitchen/**")
                        .hasRole("ADMIN")

                        // ================= ORDER ITEMS =================

                        .requestMatchers(HttpMethod.GET, "/order-items/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/order-items/**")
                        .hasRole("ADMIN")

                        // POST to /order-items is called during order creation
                        // (unauthenticated customer flow), so permit it
                        .requestMatchers(HttpMethod.POST, "/order-items/**")
                        .permitAll()

                        // ================= BILLS =================

                        .requestMatchers(HttpMethod.GET, "/api/bills")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/bills/token/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/bills/{billId}")
                        .hasRole("ADMIN")

                        // ================= PAYMENTS =================

                        // POST payment is part of the customer checkout flow
                        .requestMatchers(HttpMethod.POST, "/api/payments")
                        .permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/payments")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/payments/**")
                        .hasRole("ADMIN")

                        // ================= CART =================

                        .requestMatchers("/cart/**")
                        .authenticated()

                        .requestMatchers("/cart-items/**")
                        .authenticated()

                        // ================= ORDERS =================

                        // POST (create order) is part of the customer checkout flow
                        .requestMatchers(HttpMethod.POST, "/api/orders")
                        .permitAll()

                        .requestMatchers("/api/orders/**")
                        .authenticated()

                        // Everything else requires authentication
                        .anyRequest().authenticated()

                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}
