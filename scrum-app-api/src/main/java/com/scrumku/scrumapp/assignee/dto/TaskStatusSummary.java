package com.scrumku.scrumapp.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusSummary {
    private Integer totalTasks;
    private Integer todoCount;
    private Integer inProgressCount;
    private Integer doneCount;
    private Integer closedCount;
}

