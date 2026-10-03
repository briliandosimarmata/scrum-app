package com.scrumku.scrumapp.master.project.dto;

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
public class ProjectResponse {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String thumbnailUrl;
    private String projectKey; // Decrypted project key for display
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
