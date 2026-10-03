package com.scrumku.scrumapp.master.department.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeListResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentListWithMembersResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentRequest;
import com.scrumku.scrumapp.master.department.dto.DepartmentResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentTasksResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentWithMembersResponse;
import com.scrumku.scrumapp.master.department.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/private/v1/projects/{projectId}/departments")
@RequiredArgsConstructor
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<DepartmentListWithMembersResponse>> getAllDepartmentsWithMembers(
            @PathVariable UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<DepartmentListWithMembersResponse> response = departmentService.getAllDepartmentsWithMembers(projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentWithMembersResponse>> getDepartmentWithMembersById(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<DepartmentWithMembersResponse> response = departmentService.getDepartmentWithMembersById(id, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @GetMapping("/{id}/basic")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentById(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<DepartmentResponse> response = departmentService.getDepartmentById(id, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentWithMembersResponse>> createDepartment(
            @PathVariable UUID projectId,
            @Valid @RequestBody DepartmentRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        // Set projectId from path parameter
        request.setProjectId(projectId);
        ApiResponse<DepartmentWithMembersResponse> response = departmentService.createDepartment(request, userId);
        return ResponseEntity.status(response.getSuccess() ? 201 : 400).body(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentWithMembersResponse>> updateDepartment(
            @PathVariable UUID projectId,
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        // Set projectId and id from path parameters
        request.setProjectId(projectId);
        request.setId(id);
        ApiResponse<DepartmentWithMembersResponse> response = departmentService.updateDepartment(request, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 400).body(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Void> response = departmentService.deleteDepartmentById(id, projectId, userId);
        return ResponseEntity.status(response.getSuccess() ? 200 : 404).body(response);
    }
    
    @GetMapping("/{id}/assignees")
    public ResponseEntity<ApiResponse<AssigneeListResponse>> getAssigneesByDepartment(
            @PathVariable UUID projectId,
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<AssigneeListResponse> response = departmentService.getAssigneesByDepartment(id, projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{departmentId}/sprints/{sprintId}/tasks")
    public ResponseEntity<ApiResponse<DepartmentTasksResponse>> getDepartmentTasks(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId,
            @PathVariable UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<DepartmentTasksResponse> response = departmentService.getDepartmentTasks(projectId, departmentId, sprintId, userId);
        return ResponseEntity.ok(response);
    }
}
