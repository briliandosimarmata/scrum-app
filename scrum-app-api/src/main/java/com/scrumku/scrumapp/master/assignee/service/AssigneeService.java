package com.scrumku.scrumapp.master.assignee.service;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeListResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeRequest;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeTask;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeTasksResponse;
import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeCounterRepository;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.sprint.repository.SprintRepository;
import com.scrumku.scrumapp.task.entity.Task;
import com.scrumku.scrumapp.task.repository.TaskRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AssigneeService {
    
    private final AssigneeRepository assigneeRepository;
    private final AssigneeCounterRepository assigneeCounterRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public ApiResponse<AssigneeListResponse> getAllAssignees(UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get assignees using native query for performance
            List<Object[]> results = assigneeRepository.findAssigneesByProjectIdNative(projectId);
            
            List<AssigneeResponse> assignees = results.stream()
                    .map(this::mapToAssigneeResponse)
                    .collect(Collectors.toList());
            
            AssigneeListResponse response = AssigneeListResponse.builder()
                    .assignees(assignees)
                    .totalCount(assignees.size())
                    .build();
            
            return ApiResponse.success("Assignees retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve assignees", "ASSIGNEE_RETRIEVAL_ERROR", "Failed to retrieve assignees");
        }
    }
    
    public ApiResponse<AssigneeResponse> getAssigneeById(UUID assigneeId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get assignee using native query for performance
            var result = assigneeRepository.findAssigneeByIdAndProjectIdNative(assigneeId, projectId);
            
            if (result.isEmpty()) {
                return ApiResponse.error("Assignee not found", "ASSIGNEE_NOT_FOUND", "Assignee not found");
            }
            
            AssigneeResponse response = mapToAssigneeResponse(result.get());
            return ApiResponse.success("Assignee retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve assignee", "ASSIGNEE_RETRIEVAL_ERROR", "Failed to retrieve assignee");
        }
    }
    
    public ApiResponse<AssigneeResponse> createAssignee(AssigneeRequest request, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            Project project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Generate assignee code
            String code = generateAssigneeCode(request.getName(), project.getCode(), projectId);
            
            // Create assignee entity
            Assignee assignee = Assignee.builder()
                    .name(request.getName())
                    .code(code)
                    .project(project)
                    .build();
            
            // Save using JPA
            Assignee savedAssignee = assigneeRepository.save(assignee);
            
            // Convert to response
            AssigneeResponse response = AssigneeResponse.builder()
                    .id(savedAssignee.getId())
                    .code(savedAssignee.getCode())
                    .name(savedAssignee.getName())
                    .projectId(savedAssignee.getProject().getId())
                    .createdAt(savedAssignee.getCreatedAt())
                    .updatedAt(savedAssignee.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Assignee created successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to create assignee", "ASSIGNEE_CREATION_ERROR", "Failed to create assignee");
        }
    }
    
    public ApiResponse<AssigneeResponse> updateAssignee(UUID assigneeId, AssigneeRequest request, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Find assignee using JPA
            Assignee assignee = assigneeRepository.findByIdAndProjectId(assigneeId, projectId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            
            // Update fields
            assignee.setName(request.getName());
            
            // Save using JPA
            Assignee savedAssignee = assigneeRepository.save(assignee);
            
            // Convert to response
            AssigneeResponse response = AssigneeResponse.builder()
                    .id(savedAssignee.getId())
                    .code(savedAssignee.getCode())
                    .name(savedAssignee.getName())
                    .projectId(savedAssignee.getProject().getId())
                    .createdAt(savedAssignee.getCreatedAt())
                    .updatedAt(savedAssignee.getUpdatedAt())
                    .build();
            
            return ApiResponse.success("Assignee updated successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to update assignee", "ASSIGNEE_UPDATE_ERROR", "Failed to update assignee");
        }
    }
    
    public ApiResponse<Void> deleteAssignee(UUID assigneeId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Check if assignee exists
            if (!assigneeRepository.existsByIdAndProjectId(assigneeId, projectId)) {
                return ApiResponse.error("Assignee not found", "ASSIGNEE_NOT_FOUND", "Assignee not found");
            }
            
            // Delete using JPA
            assigneeRepository.deleteById(assigneeId);
            
            return ApiResponse.success("Assignee deleted successfully", null);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete assignee", "ASSIGNEE_DELETION_ERROR", "Failed to delete assignee");
        }
    }
    
    private String generateAssigneeCode(String name, String projectCode, UUID projectId) {
        // Extract project code prefix (first 2 characters)
        String projectPrefix = projectCode.substring(0, Math.min(2, projectCode.length()));
        
        // Generate name initials
        String nameInitials = generateNameInitials(name);
        
        // Create prefix for counter
        String prefix = projectPrefix + nameInitials;
        
        // Atomically increment counter and get the new value
        Integer counter = assigneeCounterRepository.incrementAndGetCounter(projectId, prefix);
        
        // Format counter with leading zeros (3 digits)
        String counterStr = String.format("%03d", counter);
        
        return prefix + "-" + counterStr;
    }
    
    private String generateNameInitials(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "XX"; // Default if name is empty
        }
        
        String[] words = name.trim().split("\\s+");
        
        if (words.length >= 2) {
            // Multiple words: take first letter of each word
            StringBuilder initials = new StringBuilder();
            for (String word : words) {
                if (!word.isEmpty()) {
                    initials.append(Character.toUpperCase(word.charAt(0)));
                }
            }
            return initials.toString().substring(0, Math.min(2, initials.length()));
        } else {
            // Single word: take first 2 characters
            String word = words[0];
            if (word.length() >= 2) {
                return word.substring(0, 2).toUpperCase();
            } else {
                // If word is too short, pad with X
                return (word + "X").substring(0, 2).toUpperCase();
            }
        }
    }
    
    private AssigneeResponse mapToAssigneeResponse(Object[] result) {
        return AssigneeResponse.builder()
                .id((UUID) result[0])
                .code((String) result[1])
                .name((String) result[2])
                .projectId((UUID) result[3])
                .createdAt(((java.sql.Timestamp) result[5]).toLocalDateTime())
                .updatedAt(((java.sql.Timestamp) result[6]).toLocalDateTime())
                .build();
    }
    
    /**
     * Get assignee tasks with summary data
     */
    public ApiResponse<AssigneeTasksResponse> getAssigneeTasks(UUID projectId, UUID assigneeId, UUID sprintId, UUID userId) {
        try {
            log.info("Getting assignee tasks for project: {}, assignee: {}, sprint: {}", projectId, assigneeId, sprintId);
            
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get assignee info using JPA method
            var assignee = assigneeRepository.findByIdAndProjectId(assigneeId, projectId);
            if (assignee.isEmpty()) {
                return ApiResponse.error("Assignee not found", "ASSIGNEE_NOT_FOUND", "Assignee not found");
            }
            
            String assigneeName = assignee.get().getName();
            
            // Get sprint work days and story points per day
            Object[] sprintData = sprintRepository.getSprintWorkDaysNative(sprintId);
            Long workDays = ((Number) sprintData[0]).longValue();
            Integer storyPointsPerDay = ((Number) sprintData[1]).intValue();
            
            // Calculate total capacity
            Long totalCapacity = workDays * storyPointsPerDay;
            
            // Get total story points for assignee tasks
            Long assigneeStoryPoints = taskRepository.getAssigneeStoryPointsNative(assigneeId, sprintId);
            
            // Calculate total capacity left
            Long totalCapacityLeft = totalCapacity - assigneeStoryPoints;
            
            // Get assignee tasks
            List<Object[]> taskResults = taskRepository.getAssigneeTasksNative(assigneeId, sprintId);
            List<AssigneeTask> tasks = taskResults.stream()
                    .map(this::mapToAssigneeTask)
                    .collect(Collectors.toList());
            
            // Build response
            AssigneeTasksResponse response = AssigneeTasksResponse.builder()
                    .assigneeId(assigneeId)
                    .assigneeName(assigneeName)
                    .totalCapacity(totalCapacity.intValue())
                    .totalCapacityLeft(totalCapacityLeft.intValue())
                    .tasks(tasks)
                    .build();
            
            return ApiResponse.success("Assignee tasks retrieved successfully", response);
            
        } catch (Exception e) {
            log.error("Error retrieving assignee tasks for project: {}, assignee: {}, sprint: {}", 
                    projectId, assigneeId, sprintId, e);
            return ApiResponse.error("Failed to retrieve assignee tasks", "ASSIGNEE_TASKS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Map task result to AssigneeTask
     */
    private AssigneeTask mapToAssigneeTask(Object[] result) {
        return AssigneeTask.builder()
                .taskId((UUID) result[0])
                .taskCode((String) result[1])
                .taskDescription((String) result[2])
                .taskDependency((String) result[3])
                .priority(Task.TaskPriority.valueOf((String) result[4]))
                .status(Task.TaskStatus.valueOf((String) result[5]))
                .storyPoints(((Number) result[6]).intValue())
                .order(((Number) result[7]).intValue())
                .daysSpent(BigDecimal.valueOf(((Number) result[8]).doubleValue()))
                .build();
    }
}
