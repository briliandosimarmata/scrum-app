package com.scrumku.scrumapp.auth.controller;

import com.scrumku.scrumapp.auth.dto.UserRoleResponse;
import com.scrumku.scrumapp.auth.service.UserRoleService;
import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/private/v1/user")
@RequiredArgsConstructor
public class UserRoleController {
    
    private final UserRoleService userRoleService;
    
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<UserRoleResponse>> getUserRoles() {
        
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to get user roles for user: {}", userId);
        
        ApiResponse<UserRoleResponse> response = userRoleService.getUserRoles(userId);
        
        // Return appropriate HTTP status based on success/failure
        int statusCode = response.getSuccess() ? 200 : 400;
        
        return ResponseEntity.status(statusCode).body(response);
    }
}
