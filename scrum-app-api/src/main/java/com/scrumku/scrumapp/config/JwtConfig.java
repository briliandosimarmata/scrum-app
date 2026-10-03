package com.scrumku.scrumapp.config;

import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Getter
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Getter
    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExpiration;

    @Bean
    public SecretKey secretKey() {
        // Ensure the secret is at least 256 bits (32 characters) for HS256
        String secret = jwtSecret;
        if (secret.length() < 32) {
            secret = secret + "0123456789abcdef0123456789abcdef"; // Pad to 32 chars
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

}
