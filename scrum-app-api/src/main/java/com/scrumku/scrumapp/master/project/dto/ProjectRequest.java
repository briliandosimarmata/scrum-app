package com.scrumku.scrumapp.master.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 20, message = "Project name must be between 2 and 20 characters")
    private String name;
    
    @NotBlank(message = "Project code is required")
    @Size(min = 4, max = 4, message = "Project code must be exactly 4 characters")
    @Pattern(regexp = "^[A-Za-z0-9]{4}$", message = "Project code must be exactly 4 alphanumeric characters")
    private String code;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 500, message = "Thumbnail URL must not exceed 500 characters")
    private String thumbnailUrl;
}
