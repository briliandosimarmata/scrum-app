package com.scrumku.scrumapp.master.assignee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeRequest {
    
    @NotBlank(message = "Assignee name is required")
    @Size(min = 2, max = 100, message = "Assignee name must be between 2 and 100 characters")
    private String name;
}
