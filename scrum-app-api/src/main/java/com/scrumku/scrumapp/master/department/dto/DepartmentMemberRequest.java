package com.scrumku.scrumapp.master.department.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentMemberRequest {
    
    @NotNull(message = "Assignee ID is required")
    private UUID assigneeId;
    
    @NotNull(message = "Priority flag is required")
    private Boolean isPriority;
    
    private Boolean markForDelete; // Optional - only used in update operations to mark members for deletion
}

