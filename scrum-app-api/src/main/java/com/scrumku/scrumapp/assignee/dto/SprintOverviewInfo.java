package com.scrumku.scrumapp.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintOverviewInfo {
    private UUID id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationDays;
}

