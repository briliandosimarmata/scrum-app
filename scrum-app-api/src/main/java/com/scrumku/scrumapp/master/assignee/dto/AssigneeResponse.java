package com.scrumku.scrumapp.master.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeResponse {
    private UUID id;
    private String code;
    private String name;
    private UUID projectId;
    private Boolean isPriority; // Optional - only present when fetched by department
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
