package com.scrumku.scrumapp.auth.service;

import com.scrumku.scrumapp.auth.dto.UserRoleResponse;
import com.scrumku.scrumapp.auth.repository.UserAssigneeRepository;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserRoleService {
    
    private final UserAssigneeRepository userAssigneeRepository;
    
    public ApiResponse<UserRoleResponse> getUserRoles(UUID userId) {
        try {
            log.info("Getting user roles for user: {}", userId);
            
            // Check if user has any assignee roles
            boolean isAssignee = userAssigneeRepository.existsByUserId(userId);
            
            // All authenticated users can be project managers
            boolean isProjectManager = true;
            
            UserRoleResponse response = UserRoleResponse.builder()
                    .isProjectManager(isProjectManager)
                    .isAssignee(isAssignee)
                    .build();
            
            log.info("User roles retrieved - isProjectManager: {}, isAssignee: {}", isProjectManager, isAssignee);
            
            return ApiResponse.success("User roles retrieved successfully", response);
            
        } catch (Exception e) {
            log.error("Error getting user roles for user: {}", userId, e);
            return ApiResponse.error("Failed to get user roles", "USER_ROLES_ERROR", "Failed to get user roles");
        }
    }
}
