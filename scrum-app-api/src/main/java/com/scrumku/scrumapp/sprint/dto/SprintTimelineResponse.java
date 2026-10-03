package com.scrumku.scrumapp.sprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintTimelineResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> holidays;
    private List<TaskColumnItem> taskColumn;
    private List<TaskBarItem> taskBars;
}
