package com.scrumku.scrumapp.task.dto;

import com.scrumku.scrumapp.task.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private UUID id;
    private String code;
    private String description;
    private Integer storyPoints;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private Integer taskOrder;
    
    // Related entity IDs
    private UUID projectId;
    private UUID sprintId;
    private UUID assigneeId;
    private UUID departmentId;
    private UUID dependencyTaskId;
    
    // Related entity names for display
    private String assigneeName;
    private String departmentName;
    private String dependencyTaskCode;
    
    // Audit fields
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to convert from entity
    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .code(task.getCode())
                .description(task.getDescription())
                .storyPoints(task.getStoryPoints())
                .status(task.getStatus())
                .priority(task.getPriority())
                .taskOrder(task.getTaskOrder())
                .projectId(task.getProject().getId())
                .sprintId(task.getSprint().getId())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .departmentId(task.getDepartment() != null ? task.getDepartment().getId() : null)
                .dependencyTaskId(task.getDependencyTask() != null ? task.getDependencyTask().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null)
                .departmentName(task.getDepartment() != null ? task.getDepartment().getName() : null)
                .dependencyTaskCode(task.getDependencyTask() != null ? task.getDependencyTask().getCode() : null)
                .version(task.getVersion())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
