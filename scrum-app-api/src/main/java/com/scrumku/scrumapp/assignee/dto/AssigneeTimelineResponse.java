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
public class AssigneeTimelineResponse {
    private UUID sprintId;
    private LocalDate startDate; // YYYY-MM-DD
    private LocalDate endDate;   // YYYY-MM-DD
    private List<String> holidays;
    private List<TaskItem> tasks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskItem {
        private UUID id;
        private String code;
        private String description;
        private String status;    // TODO | IN_PROGRESS | DONE | CLOSED
        private String priority;  // HIGH | MEDIUM | LOW
        private String assigneeName;
        private String departmentId;
        private LocalDate startDate; // YYYY-MM-DD
        private LocalDate endDate;   // YYYY-MM-DD
    }
}


