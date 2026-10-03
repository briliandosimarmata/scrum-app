package com.scrumku.scrumapp.auth.controller;

import com.scrumku.scrumapp.auth.dto.AuthResponse;
import com.scrumku.scrumapp.auth.dto.LoginRequest;
import com.scrumku.scrumapp.auth.dto.RegisterRequest;
import com.scrumku.scrumapp.auth.service.AuthService;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<AuthResponse> response = authService.register(request);
        return ResponseEntity.status(response.getSuccess() ? 201 : 400).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        return ResponseEntity.status(response.getSuccess() ? 200 : 401).body(response);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        // Remove "Bearer " prefix if present
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        ApiResponse<AuthResponse> response = authService.refreshToken(refreshToken);
        return ResponseEntity.status(response.getSuccess() ? 200 : 401).body(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // For JWT, logout is handled on the client side by removing the token
        // In a more complex system, you might want to maintain a blacklist of tokens
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
