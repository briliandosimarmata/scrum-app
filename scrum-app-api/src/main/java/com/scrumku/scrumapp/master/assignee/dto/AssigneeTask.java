package com.scrumku.scrumapp.master.assignee.dto;

import com.scrumku.scrumapp.task.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeTask {
    private UUID taskId;
    private String taskCode;
    private String taskDependency;
    private String taskDescription;
    private Task.TaskPriority priority;
    private Task.TaskStatus status;
    private Integer storyPoints;
    private BigDecimal daysSpent;
    private Integer order;
}
