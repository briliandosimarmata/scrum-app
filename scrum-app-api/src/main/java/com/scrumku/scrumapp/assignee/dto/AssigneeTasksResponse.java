package com.scrumku.scrumapp.assignee.dto;

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
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskItem {
        private UUID taskId;
        private String taskCode;
        private String taskDependency; // nullable
        private String taskDescription;
        private String priority; // HIGH | MEDIUM | LOW
        private String status;   // TODO | IN_PROGRESS | DONE | CLOSED
        private Integer storyPoints;
        private Integer order;
        private String departmentName;
    }

    private List<TaskItem> tasks;
    private String nextCursor; // null when no more
}



