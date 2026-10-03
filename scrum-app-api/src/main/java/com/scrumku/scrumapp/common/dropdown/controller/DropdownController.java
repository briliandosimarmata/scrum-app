package com.scrumku.scrumapp.common.dropdown.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.common.dropdown.dto.AssigneeMetadata;
import com.scrumku.scrumapp.common.dropdown.dto.DepartmentMetadata;
import com.scrumku.scrumapp.common.dropdown.dto.DropdownOptionDto;
import com.scrumku.scrumapp.common.dropdown.service.DropdownService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/private/v1/projects/{projectId}/dropdowns")
@RequiredArgsConstructor
public class DropdownController {
    
    private final DropdownService dropdownService;
    
    /**
     * Get departments for dropdown
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DropdownOptionDto<DepartmentMetadata>>>> getDepartments(
            @PathVariable UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<List<DropdownOptionDto<DepartmentMetadata>>> response = dropdownService.getDepartments(projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get assignees for dropdown
     */
    @GetMapping("/assignees")
    public ResponseEntity<ApiResponse<List<DropdownOptionDto<AssigneeMetadata>>>> getAssignees(
            @PathVariable UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<List<DropdownOptionDto<AssigneeMetadata>>> response = dropdownService.getAssignees(projectId, userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get tasks for dropdown
     */
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<DropdownOptionDto<Object>>>> getTasks(
            @PathVariable UUID projectId,
            @RequestParam UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<List<DropdownOptionDto<Object>>> response = dropdownService.getTasks(projectId, sprintId, userId);
        return ResponseEntity.ok(response);
    }
}
