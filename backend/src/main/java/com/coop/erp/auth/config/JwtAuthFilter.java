package com.coop.erp.auth.config;

import com.coop.erp.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (request.getServletPath().startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        String role = null;
        String loginType = null;
        String shopId = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                jwtService.validateToken(token);
                username = jwtService.extractUsername(token);
                role = jwtService.extractRole(token);
                loginType = jwtService.extractLoginType(token);
                shopId = jwtService.extractShopId(token);
            } catch (Exception e) {
                // Invalid token
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role != null ? "ROLE_" + role : "ROLE_USER");
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, null, Collections.singletonList(authority));
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            
            request.setAttribute("loginType", loginType);
            request.setAttribute("shopId", shopId);
        }

        filterChain.doFilter(request, response);
    }
}
