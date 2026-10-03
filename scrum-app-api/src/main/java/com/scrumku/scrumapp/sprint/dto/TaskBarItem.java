package com.scrumku.scrumapp.sprint.dto;

import com.scrumku.scrumapp.task.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBarItem {
    private UUID id;
    private String code;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private String assigneeName;
    private UUID departmentId;
    private LocalDate startDate;
    private LocalDate endDate;
}
