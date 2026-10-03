package com.scrumku.scrumapp.master.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummary {
    private Integer totalTasks;
    private Integer totalSprints;
    private Integer totalDepartments;
    private Integer totalAssignees;
}
