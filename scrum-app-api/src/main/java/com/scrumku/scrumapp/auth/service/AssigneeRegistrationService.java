package com.scrumku.scrumapp.auth.service;

import com.scrumku.scrumapp.auth.dto.AssigneeRegistrationRequest;
import com.scrumku.scrumapp.auth.dto.AssigneeRegistrationResponse;
import com.scrumku.scrumapp.auth.entity.User;
import com.scrumku.scrumapp.auth.entity.UserAssignee;
import com.scrumku.scrumapp.auth.repository.UserAssigneeRepository;
import com.scrumku.scrumapp.auth.repository.UserRepository;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.master.project.service.ProjectKeyEncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AssigneeRegistrationService {
    
    private final UserRepository userRepository;
    private final UserAssigneeRepository userAssigneeRepository;
    private final AssigneeRepository assigneeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectKeyEncryptionService projectKeyEncryptionService;
    private final AuthenticationManager authenticationManager;
    
    public ApiResponse<AssigneeRegistrationResponse> registerAssignee(AssigneeRegistrationRequest request) {
        try {
            log.info("Starting assignee registration for email: {}", request.getEmail());
            
            // Step 1: Authenticate user
            User user = authenticateUser(request.getEmail(), request.getPassword());
            if (user == null) {
                return ApiResponse.error("Invalid credentials", "INVALID_CREDENTIALS", "Invalid credentials");
            }
            
            // Step 2: Find project by provided key (user provides the decrypted key)
            log.info("Looking for project with key: {}", request.getProjectKey());
            Project project = findProjectByKey(request.getProjectKey());
            if (project == null) {
                log.warn("Project not found for key: {}", request.getProjectKey());
                return ApiResponse.error("Invalid registration information", "PROJECT_NOT_FOUND", "Invalid registration information");
            }
            log.info("Found project: {} with ID: {}", project.getName(), project.getId());
            
            // Step 4: Find assignee by code within the project
            Assignee assignee = findAssigneeByCode(request.getAssigneeCode(), project.getId());
            if (assignee == null) {
                return ApiResponse.error("Invalid registration information", "ASSIGNEE_NOT_FOUND", "Invalid registration information");
            }
            
            // Step 5: Check if user is already linked to this assignee
            if (userAssigneeRepository.existsByUserIdAndAssigneeId(user.getId(), assignee.getId())) {
                return ApiResponse.error("Registration already exists", "DUPLICATE_REGISTRATION", "Registration already exists");
            }
            
            // Step 6: Check if assignee is already linked to another user
            if (userAssigneeRepository.existsByAssigneeId(assignee.getId())) {
                return ApiResponse.error("Assignee already registered", "ASSIGNEE_ALREADY_REGISTERED", "Assignee already registered");
            }
            
            // Step 7: Create user-assignee link
            UserAssignee userAssignee = UserAssignee.builder()
                    .user(user)
                    .assignee(assignee)
                    .build();
            
            UserAssignee savedUserAssignee = userAssigneeRepository.save(userAssignee);
            
            // Step 8: Build response
            AssigneeRegistrationResponse response = buildRegistrationResponse(savedUserAssignee, user, assignee, project);
            
            log.info("Successfully registered assignee for user: {} and assignee: {}", user.getEmail(), assignee.getCode());
            return ApiResponse.success("Assignee registration successful", response);
            
        } catch (Exception e) {
            log.error("Error during assignee registration for email: {}", request.getEmail(), e);
            return ApiResponse.error("Registration failed", "REGISTRATION_ERROR", "Registration failed");
        }
    }
    
    private User authenticateUser(String email, String password) {
        try {
            // Use Spring Security's AuthenticationManager to validate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            
            // Get user from database
            return userRepository.findByEmail(email).orElse(null);
            
        } catch (Exception e) {
            log.warn("Authentication failed for email: {}", email);
            return null;
        }
    }
    
    private Project findProjectByKey(String decryptedKey) {
        try {
            // Compute deterministic digest for lookup
            String digest = projectKeyEncryptionService.computeProjectKeyDigest(decryptedKey);
            log.info("Computed digest for project key lookup");
            
            // Find project by digest
            Optional<Project> projectOpt = projectRepository.findByProjectKeyDigestNative(digest);
            
            if (projectOpt.isEmpty()) {
                log.warn("No project found with matching encrypted key");
                return null;
            }
            
            Project project = projectOpt.get();
            log.info("Found project: {} with encrypted key", project.getName());
            
            // Check if key is expired
            if (project.getKeyExpiresAt() != null && LocalDateTime.now().isAfter(project.getKeyExpiresAt())) {
                log.warn("Project key for {} has expired at {}", project.getName(), project.getKeyExpiresAt());
                return null; // Key is expired
            }
            
            log.info("Found valid project: {}", project.getName());
            return project;
            
        } catch (Exception e) {
            log.error("Error finding project by key", e);
            return null;
        }
    }
    
    private Assignee findAssigneeByCode(String assigneeCode, UUID projectId) {
        return assigneeRepository.findByCodeAndProjectId(assigneeCode, projectId).orElse(null);
    }
    
    private AssigneeRegistrationResponse buildRegistrationResponse(
            UserAssignee userAssignee, 
            User user, 
            Assignee assignee, 
            Project project) {
        
        return AssigneeRegistrationResponse.builder()
                .id(userAssignee.getId())
                .createdAt(userAssignee.getCreatedAt())
                .user(AssigneeRegistrationResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .fullName(user.getFullName())
                        .build())
                .assignee(AssigneeRegistrationResponse.AssigneeInfo.builder()
                        .id(assignee.getId())
                        .code(assignee.getCode())
                        .name(assignee.getName())
                        .projectId(assignee.getProject().getId())
                        .build())
                .project(AssigneeRegistrationResponse.ProjectInfo.builder()
                        .id(project.getId())
                        .name(project.getName())
                        .code(project.getCode())
                        .build())
                .build();
    }
}
