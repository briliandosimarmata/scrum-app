package com.scrumku.scrumapp.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeOverviewResponse {
    private SprintOverviewInfo sprint;
    private ProjectOverviewInfo project;
    private TaskStatusSummary taskSummary;
    private List<String> departments;
}

