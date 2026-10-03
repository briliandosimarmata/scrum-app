package com.scrumku.scrumapp.auth.dto;

import jakarta.validation.constraints.Email;
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
public class AssigneeRegistrationRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Assignee code is required")
    @Size(min = 1, max = 20, message = "Assignee code must be between 1 and 20 characters")
    private String assigneeCode;
    
    @NotBlank(message = "Project key is required")
    @Size(min = 8, max = 16, message = "Project key must be between 8 and 16 characters")
    private String projectKey;
}
