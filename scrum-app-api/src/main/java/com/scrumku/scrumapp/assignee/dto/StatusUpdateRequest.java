package com.scrumku.scrumapp.assignee.dto;

import lombok.Data;

// Simple request body for status update
@Data
public class StatusUpdateRequest {
    private String status;
}
