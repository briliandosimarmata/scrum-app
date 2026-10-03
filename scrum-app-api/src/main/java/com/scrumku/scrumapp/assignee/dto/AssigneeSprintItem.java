package com.scrumku.scrumapp.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeSprintItem {
    private UUID id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer taskCount;
    private SprintProjectInfo project;
    private List<String> departments;
}

