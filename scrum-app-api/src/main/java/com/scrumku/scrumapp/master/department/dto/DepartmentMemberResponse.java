package com.scrumku.scrumapp.master.department.dto;

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
public class DepartmentMemberResponse {
    private UUID assigneeId;
    private String assigneeCode;
    private String assigneeName;
    private Boolean isPriority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

