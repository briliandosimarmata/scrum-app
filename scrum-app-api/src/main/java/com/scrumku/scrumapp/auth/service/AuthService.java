package com.scrumku.scrumapp.auth.service;

import com.scrumku.scrumapp.auth.dto.AuthResponse;
import com.scrumku.scrumapp.auth.dto.LoginRequest;
import com.scrumku.scrumapp.auth.dto.RegisterRequest;
import com.scrumku.scrumapp.auth.dto.UserResponse;
import com.scrumku.scrumapp.auth.entity.User;
import com.scrumku.scrumapp.auth.repository.UserRepository;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("User with this email already exists", "USER_EXISTS", "User with this email already exists");
        }
        
        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Generate tokens
        String token = jwtService.generateToken(savedUser.getEmail());
        String refreshToken = jwtService.generateRefreshToken(savedUser.getEmail());
        
        // Create response
        UserResponse userResponse = mapToUserResponse(savedUser);
        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();
        
        return ApiResponse.success("User registered successfully", authResponse);
    }
    
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            
            // Get user from database
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            if (!user.getActive()) {
                return ApiResponse.error("Account is disabled", "ACCOUNT_DISABLED", "Account is disabled");
            }
            
            // Generate tokens
            String token = jwtService.generateToken(user.getEmail());
            String refreshToken = jwtService.generateRefreshToken(user.getEmail());
            
            // Create response
            UserResponse userResponse = mapToUserResponse(user);
            AuthResponse authResponse = AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(userResponse)
                    .build();
            
            return ApiResponse.success("Login successful", authResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Invalid email or password", "AUTHENTICATION_FAILED", "Invalid email or password");
        }
    }
    
    public ApiResponse<AuthResponse> refreshToken(String refreshToken) {
        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                return ApiResponse.error("Invalid refresh token", "INVALID_TOKEN", "Invalid refresh token");
            }
            
            String email = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            if (!user.getActive()) {
                return ApiResponse.error("Account is disabled", "ACCOUNT_DISABLED", "Account is disabled");
            }
            
            // Generate new tokens
            String newToken = jwtService.generateToken(user.getEmail());
            String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
            
            // Create response
            UserResponse userResponse = mapToUserResponse(user);
            AuthResponse authResponse = AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .user(userResponse)
                    .build();
            
            return ApiResponse.success("Token refreshed successfully", authResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Invalid refresh token", "INVALID_TOKEN", "Invalid refresh token");
        }
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
