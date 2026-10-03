package com.scrumku.scrumapp.master.department.dto;

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
public class DepartmentTask {
    private UUID taskId;
    private String taskCode;
    private String description;
    private String assigneeName;
    private Task.TaskPriority priority;
    private Integer storyPoints;
    private BigDecimal daysSpent;
}
