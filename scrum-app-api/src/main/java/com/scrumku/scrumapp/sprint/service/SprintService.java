package com.scrumku.scrumapp.sprint.service;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.sprint.dto.*;
import com.scrumku.scrumapp.sprint.entity.Sprint;
import com.scrumku.scrumapp.sprint.repository.SprintRepository;
import com.scrumku.scrumapp.task.entity.Task;
import com.scrumku.scrumapp.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AssigneeRepository assigneeRepository;

    public ApiResponse<SprintListResponse> getSprintList(UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Get sprint list using native query for performance (only id and name)
            List<Object[]> sprintResults = sprintRepository.findSprintListByProjectIdNative(projectId);

            List<SprintListItem> sprints = sprintResults.stream()
                    .map(this::mapToSprintListItem)
                    .collect(Collectors.toList());

            SprintListResponse response = SprintListResponse.builder()
                    .sprints(sprints)
                    .build();

            return ApiResponse.success("Sprint list retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error retrieving sprint list for project {}: {}", projectId, e.getMessage());
            return ApiResponse.error("Failed to retrieve sprint list", "SPRINT_LIST_RETRIEVAL_ERROR", "Failed to retrieve sprint list");
        }
    }

    public ApiResponse<SprintResponse> getSprintById(UUID sprintId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Get sprint using JPA method
            Optional<Sprint> sprintResult = sprintRepository.findByIdAndProjectId(sprintId, projectId);

            if (sprintResult.isEmpty()) {
                return ApiResponse.error("Sprint not found", "SPRINT_NOT_FOUND", "Sprint not found");
            }

            SprintResponse response = mapSprintEntityToResponse(sprintResult.get());
            return ApiResponse.success("Sprint retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error retrieving sprint {} for project {}: {}", sprintId, projectId, e.getMessage());
            return ApiResponse.error("Failed to retrieve sprint", "SPRINT_RETRIEVAL_ERROR", "Failed to retrieve sprint");
        }
    }

    public ApiResponse<SprintResponse> createSprint(SprintRequest request, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            var project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Validate date range
            if (request.getEndDate().isBefore(request.getStartDate()) ||
                    request.getEndDate().isEqual(request.getStartDate())) {
                return ApiResponse.error("Invalid date range", "INVALID_DATE_RANGE", "End date must be after start date");
            }

            // Create sprint entity
            Sprint sprint = Sprint.builder()
                    .name(request.getName())
                    .storyPointsPerDay(request.getStoryPointsPerDay())
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .specificHolidays(request.getSpecificHolidays())
                    .project(project)
                    .build();

            // Save sprint
            Sprint savedSprint = sprintRepository.save(sprint);

            // Map to response
            SprintResponse response = SprintResponse.builder()
                    .id(savedSprint.getId())
                    .name(savedSprint.getName())
                    .storyPointsPerDay(savedSprint.getStoryPointsPerDay())
                    .startDate(savedSprint.getStartDate())
                    .endDate(savedSprint.getEndDate())
                    .specificHolidays(savedSprint.getSpecificHolidays())
                    .projectId(savedSprint.getProject().getId())
                    .createdAt(savedSprint.getCreatedAt())
                    .updatedAt(savedSprint.getUpdatedAt())
                    .build();

            return ApiResponse.success("Sprint created successfully", response);

        } catch (Exception e) {
            log.error("Error creating sprint for project {}: {}", projectId, e.getMessage());
            return ApiResponse.error("Failed to create sprint", "SPRINT_CREATION_ERROR", "Failed to create sprint");
        }
    }

    public ApiResponse<SprintResponse> updateSprint(UUID sprintId, SprintRequest request, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Find existing sprint
            Sprint existingSprint = sprintRepository.findByIdAndProjectId(sprintId, projectId)
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));

            // Validate date range
            if (request.getEndDate().isBefore(request.getStartDate()) ||
                    request.getEndDate().isEqual(request.getStartDate())) {
                return ApiResponse.error("Invalid date range", "INVALID_DATE_RANGE", "End date must be after start date");
            }

            // Update sprint fields
            existingSprint.setName(request.getName());
            existingSprint.setStoryPointsPerDay(request.getStoryPointsPerDay());
            existingSprint.setStartDate(request.getStartDate());
            existingSprint.setEndDate(request.getEndDate());
            existingSprint.setSpecificHolidays(request.getSpecificHolidays());

            // Save updated sprint
            Sprint updatedSprint = sprintRepository.save(existingSprint);

            // Map to response
            SprintResponse response = SprintResponse.builder()
                    .id(updatedSprint.getId())
                    .name(updatedSprint.getName())
                    .storyPointsPerDay(updatedSprint.getStoryPointsPerDay())
                    .startDate(updatedSprint.getStartDate())
                    .endDate(updatedSprint.getEndDate())
                    .specificHolidays(updatedSprint.getSpecificHolidays())
                    .projectId(updatedSprint.getProject().getId())
                    .createdAt(updatedSprint.getCreatedAt())
                    .updatedAt(updatedSprint.getUpdatedAt())
                    .build();

            return ApiResponse.success("Sprint updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating sprint {} for project {}: {}", sprintId, projectId, e.getMessage());
            return ApiResponse.error("Failed to update sprint", "SPRINT_UPDATE_ERROR", "Failed to update sprint");
        }
    }

    public ApiResponse<Void> deleteSprint(UUID sprintId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Check if sprint exists
            if (!sprintRepository.existsByIdAndProjectId(sprintId, projectId)) {
                return ApiResponse.error("Sprint not found", "SPRINT_NOT_FOUND", "Sprint not found");
            }

            // Delete sprint
            sprintRepository.deleteById(sprintId);

            return ApiResponse.success("Sprint deleted successfully", null);

        } catch (Exception e) {
            log.error("Error deleting sprint {} for project {}: {}", sprintId, projectId, e.getMessage());
            return ApiResponse.error("Failed to delete sprint", "SPRINT_DELETION_ERROR", "Failed to delete sprint");
        }
    }

    private SprintListItem mapToSprintListItem(Object[] result) {
        return SprintListItem.builder()
                .id((UUID) result[0])
                .name((String) result[1])
                .build();
    }

    private SprintResponse mapSprintEntityToResponse(Sprint sprint) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .storyPointsPerDay(sprint.getStoryPointsPerDay())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .specificHolidays(sprint.getSpecificHolidays())
                .projectId(sprint.getProject().getId())
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }

    /**
     * Get sprint timeline data
     * TODO: Implement actual timeline algorithm
     */
    public ApiResponse<SprintTimelineResponse> getSprintTimeline(UUID projectId, UUID sprintId, UUID userId) {
        try {
            log.info("Getting sprint timeline for project: {}, sprint: {}", projectId, sprintId);

            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Verify sprint exists and belongs to project
            var sprint = sprintRepository.findByIdAndProjectId(sprintId, projectId);
            if (sprint.isEmpty()) {
                return ApiResponse.error("Sprint not found", "SPRINT_NOT_FOUND", "Sprint not found");
            }

            SprintTimelineResponse response = SprintTimelineResponse.builder()
                    .startDate(sprint.get().getStartDate())
                    .endDate(sprint.get().getEndDate())
                    .holidays(sprint.get().getSpecificHolidays())
                    .build();

            setTimelineTasks(sprint.get(), response);

            return ApiResponse.success("Sprint timeline retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error retrieving sprint timeline for project: {}, sprint: {}", projectId, sprintId, e);
            return ApiResponse.error("Failed to retrieve sprint timeline", "SPRINT_TIMELINE_ERROR", e.getMessage());
        }
    }

    private void setTimelineTasks(Sprint sprint, SprintTimelineResponse sprintTimelineResponse) {
        List<Object[]> assignees = assigneeRepository.findAssigneeInSprint(sprint.getId())
                .orElse(List.of());

        if (assignees.isEmpty()) {
            return;
        }

        List<TaskColumnItem> taskColumnItems = new ArrayList<>();
        List<TaskBarItem> taskBarItems = new ArrayList<>();

        for (Object[] assignee : assignees) {
            UUID assigneeId = (UUID) assignee[0];
            String assigneeName = (String) assignee[1];
            LocalDate lastStartDate = sprint.getStartDate();

            List<Task> tasks = taskRepository.findAssigneeTasksBySprint(assigneeId, sprint.getId());
            for (Task task : tasks) {

                TaskColumnItem taskColumnItem = TaskColumnItem.builder()
                        .id(task.getId())
                        .code(task.getCode())
                        .description(task.getDescription())
                        .departmentId(task.getDepartment().getId())
                        .build();

                taskColumnItems.add(taskColumnItem);

                long totalWorkDays = new BigDecimal(task.getStoryPoints())
                        .divide(new BigDecimal(sprint.getStoryPointsPerDay()), 0, RoundingMode.HALF_UP)
                        .longValue();

                LocalDate endDate = lastStartDate.plusDays(totalWorkDays);
                List<LocalDate> holidays = sprint.getHolidaysAsDates();

                if (holidays.isEmpty()) {
                    TaskBarItem taskBarItem = TaskBarItem.builder()
                            .id(task.getId())
                            .code(task.getCode())
                            .description(task.getDescription())
                            .status(task.getStatus())
                            .priority(task.getPriority())
                            .assigneeName(assigneeName)
                            .departmentId(task.getDepartment().getId())
                            .startDate(lastStartDate)
                            .endDate(endDate)
                            .build();
                    taskBarItems.add(taskBarItem);
                    continue;
                }

                long remainingWorkDays = totalWorkDays;
                for (LocalDate holiday : holidays) {
                    if (remainingWorkDays == 0) {
                        break;
                    }

                    if (lastStartDate.isEqual(holiday)) {
                        lastStartDate = lastStartDate.plusDays(1L);
                        continue;
                    }

                    if (lastStartDate.isAfter(holiday)) {
                        continue;
                    }

                    LocalDate tempEndDate = holiday.minusDays(1L);
                    long workDaysSpent = ChronoUnit.DAYS.between(lastStartDate, tempEndDate) + 1;

                    if (remainingWorkDays <= workDaysSpent) {
                        tempEndDate = lastStartDate.plusDays(remainingWorkDays - 1);
                        remainingWorkDays = 0;
                    } else {
                        remainingWorkDays = remainingWorkDays - workDaysSpent;
                    }

                    TaskBarItem taskBarItem = TaskBarItem.builder()
                            .id(task.getId())
                            .code(task.getCode())
                            .description(task.getDescription())
                            .status(task.getStatus())
                            .priority(task.getPriority())
                            .assigneeName(assigneeName)
                            .departmentId(task.getDepartment().getId())
                            .startDate(lastStartDate)
                            .endDate(tempEndDate)
                            .build();

                    taskBarItems.add(taskBarItem);

                    lastStartDate = holiday.plusDays(1L);
                }

                if (remainingWorkDays > 0) {
                    TaskBarItem taskBarItem = TaskBarItem.builder()
                            .id(task.getId())
                            .code(task.getCode())
                            .description(task.getDescription())
                            .status(task.getStatus())
                            .priority(task.getPriority())
                            .assigneeName(assigneeName)
                            .departmentId(task.getDepartment().getId())
                            .startDate(lastStartDate)
                            .endDate(lastStartDate.plusDays(remainingWorkDays))
                            .build();

                    taskBarItems.add(taskBarItem);
                }
            }
        }

        LocalDate maxTaskEndDate = taskBarItems.stream()
                .max((item1, item2) -> item2.getEndDate().compareTo(item1.getEndDate()))
                .map(TaskBarItem::getEndDate)
                .orElse(null);

        if (maxTaskEndDate != null && maxTaskEndDate.isAfter(sprint.getEndDate())) {
            sprintTimelineResponse.setEndDate(maxTaskEndDate);
        }

        sprintTimelineResponse.setTaskColumn(taskColumnItems);
        sprintTimelineResponse.setTaskBars(taskBarItems);
    }
}
