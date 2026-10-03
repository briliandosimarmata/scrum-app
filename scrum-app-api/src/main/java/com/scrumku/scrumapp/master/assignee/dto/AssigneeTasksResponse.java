package com.scrumku.scrumapp.master.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeTasksResponse {
    private UUID assigneeId;
    private String assigneeName;
    private Integer totalCapacity;
    private Integer totalCapacityLeft;
    private List<AssigneeTask> tasks;
}
