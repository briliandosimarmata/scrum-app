package com.scrumku.scrumapp.auth.dto;

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
public class AssigneeRegistrationResponse {
    
    private UUID id;
    private LocalDateTime createdAt;
    
    // User information
    private UserInfo user;
    
    // Assignee information
    private AssigneeInfo assignee;
    
    // Project information
    private ProjectInfo project;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssigneeInfo {
        private UUID id;
        private String code;
        private String name;
        private UUID projectId;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectInfo {
        private UUID id;
        private String name;
        private String code;
    }
}
