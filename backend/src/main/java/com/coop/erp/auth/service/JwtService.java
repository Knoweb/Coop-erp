package com.coop.erp.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    public static final String SECRET = "dGhpc2lzYW11Y2hsb25nZXJzZWNyZXRrZXl0aGF0bWVldHN0aGUyNTZiaXRyZXF1aXJlbWVudA==";

    public String generateToken(String userName, String role, String loginType, String shopId, String shopCode, String shopName) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("loginType", loginType);
        if (shopId != null) {
            claims.put("shopId", shopId);
        }
        if (shopCode != null) {
            claims.put("shopCode", shopCode);
        }
        if (shopName != null) {
            claims.put("shopName", shopName);
        }
        return createToken(claims, userName);
    }

    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }

    private String createToken(Map<String, Object> claims, String userName) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30)) // Expires in 30 mins
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().getSubject();
    }

    public String extractRole(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().get("role");
    }

    public String extractLoginType(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().get("loginType");
    }

    public String extractShopId(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().get("shopId");
    }

    public String extractShopCode(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().get("shopCode");
    }

    public String extractShopName(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody().get("shopName");
    }
}