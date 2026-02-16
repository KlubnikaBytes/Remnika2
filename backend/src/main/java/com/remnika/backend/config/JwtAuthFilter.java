package com.remnika.backend.config;

import com.remnika.backend.entity.Session;
import com.remnika.backend.repository.SessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtils jwtUtils;
    private final SessionRepository sessionRepository;

    public JwtAuthFilter(JwtUtils jwtUtils, SessionRepository sessionRepository) {
        this.jwtUtils = jwtUtils;
        this.sessionRepository = sessionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String userEmail;
        final String jwtToken;

        // 1. Check if the header contains a Bearer token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);

        try {
            // 2. Extract Username and handle Malformed/Expired tokens gracefully
            userEmail = jwtUtils.extractUsername(jwtToken);
        } catch (Exception e) {
            log.error("Invalid JWT Token: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 3. Process 1.2.4: Check D2 Session Store to see if token is still ACTIVE
            boolean isSessionActive = sessionRepository.findByToken(jwtToken)
                    .map(Session::isActive)
                    .orElse(false);

            if (isSessionActive && jwtUtils.isTokenValid(jwtToken, userEmail)) {
                // 4. Create Security Context
                UserDetails userDetails = new User(userEmail, "", Collections.emptyList());
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Authenticate the request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.warn("Attempted access with inactive session for user: {}", userEmail);
            }
        }
        filterChain.doFilter(request, response);
    }
}