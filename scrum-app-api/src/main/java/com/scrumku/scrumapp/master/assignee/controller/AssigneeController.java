package com.scrumku.scrumapp.master.assignee.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeListResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeRequest;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeTasksResponse;
import com.scrumku.scrumapp.master.assignee.service.AssigneeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/private/v1/projects/{projectId}/assignees")
@RequiredArgsConstructor
public class AssigneeController {
    
    private final AssigneeService assigneeService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<AssigneeListResponse>> getAllAssignees(
            @PathVariable UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeListResponse> response = assigneeService.getAllAssignees(projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssigneeResponse>> getAssigneeById(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeResponse> response = assigneeService.getAssigneeById(id, projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<AssigneeResponse>> createAssignee(
            @PathVariable UUID projectId,
            @Valid @RequestBody AssigneeRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeResponse> response = assigneeService.createAssignee(request, projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssigneeResponse>> updateAssignee(
            @PathVariable UUID projectId,
            @PathVariable UUID id,
            @Valid @RequestBody AssigneeRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeResponse> response = assigneeService.updateAssignee(id, request, projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignee(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Void> response = assigneeService.deleteAssignee(id, projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{assigneeId}/sprints/{sprintId}/tasks")
    public ResponseEntity<ApiResponse<AssigneeTasksResponse>> getAssigneeTasks(
            @PathVariable UUID projectId,
            @PathVariable UUID assigneeId,
            @PathVariable UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeTasksResponse> response = assigneeService.getAssigneeTasks(projectId, assigneeId, sprintId, userId);
        return ResponseEntity.ok(response);
    }
}
