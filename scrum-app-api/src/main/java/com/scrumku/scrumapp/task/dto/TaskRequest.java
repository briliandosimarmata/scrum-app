package com.scrumku.scrumapp.task.dto;

import com.scrumku.scrumapp.task.entity.Task;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    // Task code is auto-generated, not required in request

    @NotNull(message = "Task description is required")
    @Size(max = 500, message = "Task description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Story points are required")
    @Min(value = 1, message = "Story points must be at least 1")
    @Max(value = 100, message = "Story points must not exceed 100")
    private Integer storyPoints;

    @NotNull(message = "Task status is required")
    private Task.TaskStatus status;

    @NotNull(message = "Task priority is required")
    private Task.TaskPriority priority;

    @NotNull(message = "Sprint ID is required")
    private UUID sprintId;

    private UUID assigneeId;

    private UUID departmentId;

    // Dependency task is optional
    private UUID dependencyTaskId;

    // Helper method to convert to entity
    public Task toEntity() {
        return Task.builder()
                .description(this.description)
                .storyPoints(this.storyPoints)
                .status(this.status)
                .priority(this.priority)
                .taskOrder(1) // Default order, will be updated by service
                .build();
    }
}
