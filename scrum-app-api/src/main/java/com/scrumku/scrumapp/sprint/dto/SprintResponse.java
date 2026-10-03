package com.scrumku.scrumapp.sprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintResponse {
    private UUID id;
    private String name;
    private Integer storyPointsPerDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> specificHolidays;
    private UUID projectId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
