package com.scrumku.scrumapp.common.dropdown.service;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.common.dropdown.dto.AssigneeMetadata;
import com.scrumku.scrumapp.common.dropdown.dto.DepartmentMetadata;
import com.scrumku.scrumapp.common.dropdown.dto.DropdownOptionDto;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.department.repository.DepartmentRepository;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.task.repository.TaskRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DropdownService {
    
    private final DepartmentRepository departmentRepository;
    private final AssigneeRepository assigneeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * Get departments for dropdown
     */
    public ApiResponse<List<DropdownOptionDto<DepartmentMetadata>>> getDepartments(UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get departments using native query for performance
            List<Object[]> departmentResults = departmentRepository.findDepartmentsForDropdownNative(projectId);
            
            List<DropdownOptionDto<DepartmentMetadata>> departments = departmentResults.stream()
                    .map(this::mapToDepartmentDropdownOption)
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Departments retrieved successfully", departments);
            
        } catch (Exception e) {
            log.error("Error retrieving departments for project {}: {}", projectId, e.getMessage());
            return ApiResponse.error("Failed to retrieve departments", "DEPARTMENT_DROPDOWN_ERROR", "Failed to retrieve departments");
        }
    }
    
    /**
     * Get assignees for dropdown
     */
    public ApiResponse<List<DropdownOptionDto<AssigneeMetadata>>> getAssignees(UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get assignees using native query for performance
            List<Object[]> assigneeResults = assigneeRepository.findAssigneesForDropdownNative(projectId);
            
            List<DropdownOptionDto<AssigneeMetadata>> assignees = assigneeResults.stream()
                    .map(this::mapToAssigneeDropdownOption)
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Assignees retrieved successfully", assignees);
            
        } catch (Exception e) {
            log.error("Error retrieving assignees for project {}: {}", projectId, e.getMessage());
            return ApiResponse.error("Failed to retrieve assignees", "ASSIGNEE_DROPDOWN_ERROR", "Failed to retrieve assignees");
        }
    }
    
    /**
     * Map department result to dropdown option
     */
    private DropdownOptionDto<DepartmentMetadata> mapToDepartmentDropdownOption(Object[] result) {
        String id = result[0].toString();
        String name = (String) result[1];
        
        return DropdownOptionDto.<DepartmentMetadata>builder()
                .id(id)
                .name(name)
                .displayName(name) // Same as name for departments
                .metadata(null) // No metadata for departments
                .build();
    }
    
    /**
     * Get tasks for dropdown
     */
    public ApiResponse<List<DropdownOptionDto<Object>>> getTasks(UUID projectId, UUID sprintId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get tasks using native query for performance
            List<Object[]> taskResults = taskRepository.findTasksForDropdownNative(projectId, sprintId);
            
            List<DropdownOptionDto<Object>> tasks = taskResults.stream()
                    .map(this::mapToTaskDropdownOption)
                    .collect(Collectors.toList());
            
            return ApiResponse.success("Tasks retrieved successfully", tasks);
            
        } catch (Exception e) {
            log.error("Error retrieving tasks for project {} and sprint {}: {}", projectId, sprintId, e.getMessage());
            return ApiResponse.error("Failed to retrieve tasks", "TASK_DROPDOWN_ERROR", "Failed to retrieve tasks");
        }
    }
    
    /**
     * Map assignee result to dropdown option
     */
    private DropdownOptionDto<AssigneeMetadata> mapToAssigneeDropdownOption(Object[] result) {
        String id = result[0].toString();
        String name = (String) result[1];
        String departmentId = result[2] != null ? result[2].toString() : null;
        
        AssigneeMetadata metadata = AssigneeMetadata.builder()
                .departmentId(departmentId)
                .build();
        
        return DropdownOptionDto.<AssigneeMetadata>builder()
                .id(id)
                .name(name)
                .displayName(name) // Same as name for assignees
                .metadata(metadata)
                .build();
    }
    
    /**
     * Map task result to dropdown option
     */
    private DropdownOptionDto<Object> mapToTaskDropdownOption(Object[] result) {
        String id = result[0].toString();
        String code = (String) result[1];
        String description = (String) result[2];
        
        // Create display name: "CODE - Description"
        String displayName = code + " - " + description;
        
        return DropdownOptionDto.<Object>builder()
                .id(id)
                .name(code)
                .displayName(displayName)
                .metadata(null) // No metadata needed for tasks
                .build();
    }
}
