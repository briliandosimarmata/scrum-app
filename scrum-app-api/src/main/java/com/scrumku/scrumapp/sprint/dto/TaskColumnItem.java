package com.scrumku.scrumapp.sprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskColumnItem {
    private UUID id;
    private String code;
    private String description;
    private UUID departmentId;
}
