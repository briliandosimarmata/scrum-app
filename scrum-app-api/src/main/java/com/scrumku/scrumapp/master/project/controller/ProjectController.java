package com.scrumku.scrumapp.master.project.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectListResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectRequest;
import com.scrumku.scrumapp.master.project.dto.ProjectResponse;
import com.scrumku.scrumapp.master.project.dto.ProjectSummary;
import com.scrumku.scrumapp.master.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/private/v1/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ProjectService projectService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<ProjectListResponse>> getAllProjects() {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectListResponse> response = projectService.getAllProjects(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectResponse> response = projectService.getProjectById(id, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectByCode(@PathVariable String code) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectResponse> response = projectService.getProjectByCode(code, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectResponse> response = projectService.createProject(request, userId);
        return ResponseEntity.status(response.getSuccess() ? 201 : 400).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID id, 
            @Valid @RequestBody ProjectRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectResponse> response = projectService.updateProject(id, request, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Void> response = projectService.deleteProject(id, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<ProjectSummary>> getProjectSummary(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectSummary> response = projectService.getProjectSummary(id, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @PostMapping("/{id}/keys")
    public ResponseEntity<ApiResponse<ProjectResponse>> generateProjectKey(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<ProjectResponse> response = projectService.generateProjectKey(id, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
}
