package com.scrumku.scrumapp.master.project.service;

import com.scrumku.scrumapp.auth.entity.User;
import com.scrumku.scrumapp.auth.repository.UserRepository;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectListResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectRequest;
import com.scrumku.scrumapp.master.project.dto.ProjectResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectSummary;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectKeyEncryptionService projectKeyEncryptionService;
    
    @Value("${project.key.expiration-days:30}")
    private int projectKeyExpirationDays;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public ApiResponse<ProjectListResponse> getAllProjects(UUID userId) {
        try {
            // Use JPA method for now (can be optimized with native query later)
            List<Project> projectEntities = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
            List<ProjectResponse> projects = new ArrayList<>();
            
            for (Project project : projectEntities) {
                ProjectResponse projectResponse = ProjectResponse.builder()
                        .id(project.getId())
                        .name(project.getName())
                        .code(project.getCode())
                        .description(project.getDescription())
                        .thumbnailUrl(project.getThumbnailUrl())
                        .projectKey(decryptProjectKeyForDisplay(project.getProjectKey()))
                        .createdAt(project.getCreatedAt())
                        .updatedAt(project.getUpdatedAt())
                        .build();
                projects.add(projectResponse);
            }
            
            ProjectListResponse response = ProjectListResponse.builder()
                    .projects(projects)
                    .totalCount(projects.size())
                    .build();
            
            return ApiResponse.success("Projects retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve projects", "PROJECT_RETRIEVAL_ERROR", "Failed to retrieve projects");
        }
    }
    
    public ApiResponse<ProjectResponse> getProjectById(UUID projectId, UUID userId) {
        try {
            // Use JPA method for now
            Optional<Project> projectOpt = projectRepository.findByIdAndUserId(projectId, userId);
            
            if (projectOpt.isEmpty()) {
                return ApiResponse.error("Project not found", "PROJECT_NOT_FOUND", "Project not found");
            }
            
            Project project = projectOpt.get();
            ProjectResponse projectResponse = ProjectResponse.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .code(project.getCode())
                    .description(project.getDescription())
                    .thumbnailUrl(project.getThumbnailUrl())
                    .projectKey(decryptProjectKeyForDisplay(project.getProjectKey()))
                    .createdAt(project.getCreatedAt())
                    .updatedAt(project.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Project retrieved successfully", projectResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve project", "PROJECT_RETRIEVAL_ERROR", "Failed to retrieve project");
        }
    }
    
    public ApiResponse<ProjectResponse> getProjectByCode(String code, UUID userId) {
        try {
            // Use JPA method for now
            Optional<Project> projectOpt = projectRepository.findByCodeAndUserId(code, userId);
            
            if (projectOpt.isEmpty()) {
                return ApiResponse.error("Project not found", "PROJECT_NOT_FOUND", "Project not found");
            }
            
            Project project = projectOpt.get();
            ProjectResponse projectResponse = ProjectResponse.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .code(project.getCode())
                    .description(project.getDescription())
                    .thumbnailUrl(project.getThumbnailUrl())
                    .projectKey(decryptProjectKeyForDisplay(project.getProjectKey()))
                    .createdAt(project.getCreatedAt())
                    .updatedAt(project.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Project retrieved successfully", projectResponse);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve project", "PROJECT_RETRIEVAL_ERROR", "Failed to retrieve project");
        }
    }
    
    public ApiResponse<ProjectResponse> createProject(ProjectRequest request, UUID userId) {
        try {
            // Check if project code already exists for this user
            if (projectRepository.existsByCodeAndUserId(request.getCode(), userId)) {
                return ApiResponse.error("Project code already exists", "PROJECT_CODE_EXISTS", "Project code already exists. Please choose a different code.");
            }
            
            // Get user entity
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create project entity
            Project project = Project.builder()
                    .name(request.getName())
                    .code(request.getCode().toUpperCase()) // Convert to uppercase for consistency
                    .description(request.getDescription())
                    .thumbnailUrl(request.getThumbnailUrl())
                    .user(user)
                    .build();
            
            // Save using JPA
            Project savedProject = projectRepository.save(project);
            
            // Convert to response
            ProjectResponse response = ProjectResponse.builder()
                    .id(savedProject.getId())
                    .name(savedProject.getName())
                    .code(savedProject.getCode())
                    .description(savedProject.getDescription())
                    .thumbnailUrl(savedProject.getThumbnailUrl())
                    .projectKey(decryptProjectKeyForDisplay(savedProject.getProjectKey()))
                    .createdAt(savedProject.getCreatedAt())
                    .updatedAt(savedProject.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Project created successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to create project", "PROJECT_CREATION_ERROR", "Failed to create project");
        }
    }
    
    public ApiResponse<ProjectResponse> updateProject(UUID projectId, ProjectRequest request, UUID userId) {
        try {
            // Find project using JPA
            Project project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Update fields (code cannot be changed - ignore request.getCode())
            project.setName(request.getName());
            project.setDescription(request.getDescription());
            project.setThumbnailUrl(request.getThumbnailUrl());
            
            // Save using JPA
            Project savedProject = projectRepository.save(project);
            
            // Convert to response
            ProjectResponse response = ProjectResponse.builder()
                    .id(savedProject.getId())
                    .name(savedProject.getName())
                    .code(savedProject.getCode())
                    .description(savedProject.getDescription())
                    .thumbnailUrl(savedProject.getThumbnailUrl())
                    .projectKey(decryptProjectKeyForDisplay(savedProject.getProjectKey()))
                    .createdAt(savedProject.getCreatedAt())
                    .updatedAt(savedProject.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Project updated successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to update project", "PROJECT_UPDATE_ERROR", "Failed to update project");
        }
    }
    
    public ApiResponse<Void> deleteProject(UUID projectId, UUID userId) {
        try {
            // Check if project exists and belongs to user
            if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
                return ApiResponse.error("Project not found", "PROJECT_NOT_FOUND", "Project not found");
            }
            
            // Delete using JPA
            projectRepository.deleteById(projectId);
            
            return ApiResponse.success("Project deleted successfully", null);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete project", "PROJECT_DELETION_ERROR", "Failed to delete project");
        }
    }
    
    public ApiResponse<ProjectSummary> getProjectSummary(UUID projectId, UUID userId) {
        try {
            log.info("Getting project summary for project: {} and user: {}", projectId, userId);
            
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            log.info("Project found, using EntityManager for counts...");
            
            // Use EntityManager to execute individual count queries
            Long totalTasks = (Long) entityManager.createNativeQuery("SELECT COUNT(*) FROM tasks WHERE project_id = :projectId")
                    .setParameter("projectId", projectId)
                    .getSingleResult();
            
            Long totalSprints = (Long) entityManager.createNativeQuery("SELECT COUNT(*) FROM sprints WHERE project_id = :projectId")
                    .setParameter("projectId", projectId)
                    .getSingleResult();
            
            Long totalDepartments = (Long) entityManager.createNativeQuery("SELECT COUNT(*) FROM departments WHERE project_id = :projectId")
                    .setParameter("projectId", projectId)
                    .getSingleResult();
            
            Long totalAssignees = (Long) entityManager.createNativeQuery("SELECT COUNT(*) FROM assignees WHERE project_id = :projectId")
                    .setParameter("projectId", projectId)
                    .getSingleResult();
            
            log.info("Counts - Tasks: {}, Sprints: {}, Departments: {}, Assignees: {}", 
                    totalTasks, totalSprints, totalDepartments, totalAssignees);
            
            // Map result to ProjectSummary
            ProjectSummary summary = ProjectSummary.builder()
                    .totalTasks(totalTasks.intValue())
                    .totalSprints(totalSprints.intValue())
                    .totalDepartments(totalDepartments.intValue())
                    .totalAssignees(totalAssignees.intValue())
                    .build();
            
            return ApiResponse.success("Project summary retrieved successfully", summary);
            
        } catch (Exception e) {
            log.error("Error retrieving project summary for project: {}", projectId, e);
            return ApiResponse.error("Failed to retrieve project summary", "PROJECT_SUMMARY_ERROR", "Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }
    
    /**
     * Generate a new project key for the specified project
     */
    public ApiResponse<ProjectResponse> generateProjectKey(UUID projectId, UUID userId) {
        try {
            // Find project and verify ownership
            Project project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Generate random project key
            String randomKey = projectKeyEncryptionService.generateRandomProjectKey();
            
            // Encrypt the key and compute digest
            String encryptedKey = projectKeyEncryptionService.encryptProjectKey(randomKey);
            String digest = projectKeyEncryptionService.computeProjectKeyDigest(randomKey);
            
            // Set expiration timestamp
            LocalDateTime expirationTime = LocalDateTime.now().plusDays(projectKeyExpirationDays);
            
            // Update project with encrypted key and expiration
            project.setProjectKey(encryptedKey);
            project.setProjectKeyDigest(digest);
            project.setKeyExpiresAt(expirationTime);
            Project savedProject = projectRepository.save(project);
            
            // Convert to response
            ProjectResponse response = ProjectResponse.builder()
                    .id(savedProject.getId())
                    .name(savedProject.getName())
                    .code(savedProject.getCode())
                    .description(savedProject.getDescription())
                    .thumbnailUrl(savedProject.getThumbnailUrl())
                    .projectKey(randomKey) // Return the decrypted key for display
                    .createdAt(savedProject.getCreatedAt())
                    .updatedAt(savedProject.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Project key generated successfully", response);
            
        } catch (Exception e) {
            log.error("Error generating project key for project: {}", projectId, e);
            return ApiResponse.error("Failed to generate project key", "PROJECT_KEY_GENERATION_ERROR", "Failed to generate project key");
        }
    }
    
    /**
     * Decrypt project key for display purposes
     * Returns null if key is invalid or expired
     */
    private String decryptProjectKeyForDisplay(String encryptedKey) {
        if (encryptedKey == null || encryptedKey.isEmpty()) {
            return null;
        }
        
        try {
            return projectKeyEncryptionService.decryptProjectKey(encryptedKey);
        } catch (Exception e) {
            log.warn("Failed to decrypt project key for display: {}", e.getMessage());
            return null; // Return null for invalid/expired keys
        }
    }
    
}
