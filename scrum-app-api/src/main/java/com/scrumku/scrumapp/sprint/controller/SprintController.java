package com.scrumku.scrumapp.sprint.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.sprint.dto.SprintListResponse;
import com.scrumku.scrumapp.sprint.dto.SprintRequest;
import com.scrumku.scrumapp.sprint.dto.SprintResponse;
import com.scrumku.scrumapp.sprint.dto.SprintTimelineResponse;
import com.scrumku.scrumapp.sprint.service.SprintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/private/v1/projects/{projectId}/sprints")
@RequiredArgsConstructor
public class SprintController {
    
    private final SprintService sprintService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<SprintListResponse>> getSprintList(
            @PathVariable UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<SprintListResponse> response = sprintService.getSprintList(projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SprintResponse>> getSprintById(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<SprintResponse> response = sprintService.getSprintById(id, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(
            @PathVariable UUID projectId,
            @Valid @RequestBody SprintRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        // Set projectId from path parameter
        request.setProjectId(projectId);
        ApiResponse<SprintResponse> response = sprintService.createSprint(request, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 201 : 400).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(
            @PathVariable UUID projectId,
            @PathVariable UUID id,
            @Valid @RequestBody SprintRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        // Set projectId and id from path parameters
        request.setProjectId(projectId);
        request.setId(id);
        ApiResponse<SprintResponse> response = sprintService.updateSprint(id, request, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 400).body(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSprint(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Void> response = sprintService.deleteSprint(id, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @GetMapping("/{sprintId}/timeline")
    public ResponseEntity<ApiResponse<SprintTimelineResponse>> getSprintTimeline(
            @PathVariable UUID projectId,
            @PathVariable UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<SprintTimelineResponse> response = sprintService.getSprintTimeline(projectId, sprintId, userId);
        return ResponseEntity.ok(response);
    }
}
