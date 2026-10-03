package com.scrumku.scrumapp.assignee.service;

import com.scrumku.scrumapp.assignee.dto.*;
import com.scrumku.scrumapp.auth.repository.UserAssigneeRepository;
import com.scrumku.scrumapp.common.dto.ApiResponse;
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
import java.sql.Date;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AssigneeSprintService {

    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final UserAssigneeRepository userAssigneeRepository;

    /**
     * Get all sprints for assignees linked to the user
     *
     * @param userId The user ID
     * @return ApiResponse with list of sprints
     */
    public ApiResponse<AssigneeSprintListResponse> getAssigneeSprints(UUID userId) {
        try {
            log.info("Fetching sprints for user: {}", userId);

            List<Object[]> results = sprintRepository.findSprintsByUserAssigneesNative(userId);

            List<AssigneeSprintItem> sprints = new ArrayList<>();

            for (Object[] row : results) {
                AssigneeSprintItem sprint = mapRowToAssigneeSprintItem(row);
                sprints.add(sprint);
            }

            log.info("Found {} sprints for user: {}", sprints.size(), userId);

            AssigneeSprintListResponse response = AssigneeSprintListResponse.builder()
                    .sprints(sprints)
                    .build();

            return ApiResponse.success("Assignee sprints retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching assignee sprints for user: {}", userId, e);
            return ApiResponse.error(
                    "Failed to fetch assignee sprints",
                    "FETCH_SPRINTS_ERROR",
                    "An error occurred while fetching sprints"
            );
        }
    }

    /**
     * Get a specific sprint by ID for an assignee user
     *
     * @param sprintId The sprint ID
     * @param userId   The user ID
     * @return ApiResponse with sprint details or error if not found/unauthorized
     */
    public ApiResponse<AssigneeSprintItem> getAssigneeSprintById(UUID sprintId, UUID userId) {
        try {
            log.info("Fetching sprint {} for user: {}", sprintId, userId);

            Optional<Object[]> resultOpt = sprintRepository.findSprintByIdForAssigneeNative(sprintId, userId);

            if (resultOpt.isEmpty()) {
                log.warn("Sprint {} not found or user {} doesn't have access", sprintId, userId);
                return ApiResponse.error(
                        "Sprint not found or access denied",
                        "SPRINT_NOT_FOUND",
                        "The requested sprint does not exist or you don't have access to it"
                );
            }

            AssigneeSprintItem sprint = mapRowToAssigneeSprintItem(resultOpt.get());
            log.info("Successfully retrieved sprint {} for user: {}", sprintId, userId);

            return ApiResponse.success("Sprint retrieved successfully", sprint);

        } catch (Exception e) {
            log.error("Error fetching sprint {} for user: {}", sprintId, userId, e);
            return ApiResponse.error(
                    "Failed to fetch sprint",
                    "FETCH_SPRINT_ERROR",
                    "An error occurred while fetching sprint details"
            );
        }
    }

    /**
     * Get paginated tasks for the authenticated user's assignees in a sprint
     */
    public ApiResponse<AssigneeTasksResponse> getAssigneeTasks(UUID sprintId, UUID userId, int limit, String cursor) {
        try {
            // Parse cursor
            Integer afterOrder = null;
            Integer afterPriorityRank = null;
            OffsetDateTime afterCreatedAt = null;
            UUID afterId = null;
            if (cursor != null && !cursor.isBlank()) {
                try {
                    String json = new String(java.util.Base64.getUrlDecoder().decode(cursor));
                    String[] parts = json.replace("{", "").replace("}", "").split(",");
                    for (String p : parts) {
                        String[] kv = p.split(":");
                        if (kv.length != 2) continue;
                        String key = kv[0].trim().replace("\"", "");
                        String val = kv[1].trim().replace("\"", "");
                        switch (key) {
                            case "order":
                                afterOrder = Integer.valueOf(val);
                                break;
                            case "priorityRank":
                                afterPriorityRank = Integer.valueOf(val);
                                break;
                            case "createdAt":
                                afterCreatedAt = OffsetDateTime.parse(val);
                                break;
                            case "id":
                                afterId = UUID.fromString(val);
                                break;
                        }
                    }
                } catch (Exception ignore) {
                }
            }

            List<Object[]> rows = taskRepository.findUserAssigneeTasksPagedNative(userId, sprintId, limit,
                    afterOrder, afterPriorityRank, afterCreatedAt, afterId);

            List<AssigneeTasksResponse.TaskItem> items = new ArrayList<>();
            String nextCursor = null;

            for (Object[] r : rows) {
                int i = 0;
                UUID id = (UUID) r[i++];
                String code = (String) r[i++];
                String description = (String) r[i++];
                Integer storyPoints = convertToInteger(r[i++]);
                String statusStr = (String) r[i++];
                String priorityStr = (String) r[i++];
                Integer order = convertToInteger(r[i++]);
                java.sql.Timestamp createdAtTs = (java.sql.Timestamp) r[i++];
                String depCode = (String) r[i++];
                String departmentName = (String) r[i++];
                Integer priorityRank = convertToInteger(r[i++]);

                items.add(AssigneeTasksResponse.TaskItem.builder()
                        .taskId(id)
                        .taskCode(code)
                        .taskDescription(description)
                        .storyPoints(storyPoints)
                        .status(statusStr)
                        .priority(priorityStr)
                        .order(order)
                        .taskDependency(depCode != null && depCode.isEmpty() ? null : depCode)
                        .departmentName(departmentName)
                        .build());

                // build next cursor from the last row
                afterOrder = order;
                afterPriorityRank = priorityRank;
                afterCreatedAt = createdAtTs.toInstant().atOffset(java.time.ZoneOffset.UTC);
                afterId = id;
            }

            if (!rows.isEmpty() && rows.size() == limit) {
                String json = String.format("{\"order\":%d,\"priorityRank\":%d,\"createdAt\":\"%s\",\"id\":\"%s\"}",
                        afterOrder, afterPriorityRank, afterCreatedAt.toString(), afterId);
                nextCursor = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes());
            }

            AssigneeTasksResponse payload = AssigneeTasksResponse.builder()
                    .tasks(items)
                    .nextCursor(nextCursor)
                    .build();

            return ApiResponse.success("Tasks retrieved successfully", payload);
        } catch (Exception e) {
            log.error("Error fetching assignee tasks for sprint {} and user {}", sprintId, userId, e);
            return ApiResponse.error("Failed to fetch tasks", "FETCH_TASKS_ERROR", "An error occurred while fetching tasks");
        }
    }

    /**
     * Update task status for user's accessible task
     */
    @Transactional
    public ApiResponse<Void> updateAssigneeTaskStatus(UUID sprintId, UUID taskId, UUID userId, com.scrumku.scrumapp.task.entity.Task.TaskStatus status) {
        try {
            int updated = taskRepository.updateTaskStatusForUser(userId, sprintId, taskId, status.name());
            if (updated == 0) {
                return ApiResponse.error("Task not found or access denied", "TASK_NOT_FOUND", "Task does not exist or you don't have access");
            }
            return ApiResponse.success("Task status updated", null);
        } catch (Exception e) {
            log.error("Error updating task {} status to {} for sprint {} and user {}", taskId, status, sprintId, userId, e);
            return ApiResponse.error("Failed to update task status", "UPDATE_STATUS_ERROR", "An error occurred while updating task status");
        }
    }

    /**
     * Map database row to AssigneeSprintItem DTO
     * Row structure: sprint_id, sprint_name, start_date, end_date, task_count,
     * project_id, project_name, project_thumbnail_url, project_description,
     * departments
     */
    private AssigneeSprintItem mapRowToAssigneeSprintItem(Object[] row) {
        int idx = 0;

        UUID sprintId = (UUID) row[idx++];
        String sprintName = (String) row[idx++];
        LocalDate startDate = convertToLocalDate(row[idx++]);
        LocalDate endDate = convertToLocalDate(row[idx++]);
        Integer taskCount = convertToInteger(row[idx++]);

        UUID projectId = (UUID) row[idx++];
        String projectName = (String) row[idx++];
        String projectThumbnailUrl = (String) row[idx++];
        String projectDescription = (String) row[idx++];
        String departmentsStr = (String) row[idx++];

        // Build project info
        SprintProjectInfo projectInfo = SprintProjectInfo.builder()
                .id(projectId)
                .name(projectName)
                .thumbnailUrl(projectThumbnailUrl)
                .description(projectDescription)
                .build();

        // Parse departments string into list
        List<String> departments = parseDepartments(departmentsStr);

        return AssigneeSprintItem.builder()
                .id(sprintId)
                .name(sprintName)
                .startDate(startDate)
                .endDate(endDate)
                .taskCount(taskCount)
                .project(projectInfo)
                .departments(departments)
                .build();
    }

    /**
     * Convert SQL Date/LocalDate object to LocalDate
     */
    private LocalDate convertToLocalDate(Object dateObj) {
        if (dateObj == null) {
            return null;
        }
        if (dateObj instanceof LocalDate) {
            return (LocalDate) dateObj;
        }
        if (dateObj instanceof Date) {
            return ((Date) dateObj).toLocalDate();
        }
        if (dateObj instanceof java.util.Date) {
            return new Date(((java.util.Date) dateObj).getTime()).toLocalDate();
        }
        return null;
    }

    /**
     * Convert number object to Integer
     */
    private Integer convertToInteger(Object numberObj) {
        if (numberObj == null) {
            return 0;
        }
        if (numberObj instanceof Integer) {
            return (Integer) numberObj;
        }
        if (numberObj instanceof Long) {
            return ((Long) numberObj).intValue();
        }
        if (numberObj instanceof BigDecimal) {
            return ((BigDecimal) numberObj).intValue();
        }
        return 0;
    }

    /**
     * Parse comma-separated departments string into list
     */
    private List<String> parseDepartments(String departmentsStr) {
        if (departmentsStr == null || departmentsStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(departmentsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Get sprint overview data for assignee dashboard
     *
     * @param sprintId The sprint ID
     * @param userId   The user ID
     * @return ApiResponse with overview data
     */
    public ApiResponse<AssigneeOverviewResponse> getAssigneeSprintOverview(UUID sprintId, UUID userId) {
        try {
            log.info("Fetching sprint overview for sprint {} and user: {}", sprintId, userId);

            // Get sprint and project info
            Optional<Object[]> sprintResultOpt = sprintRepository.findSprintByIdForAssigneeNative(sprintId, userId);

            if (sprintResultOpt.isEmpty()) {
                log.warn("Sprint {} not found or user {} doesn't have access", sprintId, userId);
                return ApiResponse.error(
                        "Sprint not found or access denied",
                        "SPRINT_NOT_FOUND",
                        "The requested sprint does not exist or you don't have access to it"
                );
            }


            Object[] sprintRow = sprintResultOpt.get();
            int idx = 0;

            UUID sprintIdFromDb = (UUID) sprintRow[idx++];
            String sprintName = (String) sprintRow[idx++];
            LocalDate startDate = convertToLocalDate(sprintRow[idx++]);
            LocalDate endDate = convertToLocalDate(sprintRow[idx++]);
            Integer taskCount = convertToInteger(sprintRow[idx++]);

            UUID projectId = (UUID) sprintRow[idx++];
            String projectName = (String) sprintRow[idx++];
            String projectThumbnailUrl = (String) sprintRow[idx++];
            String projectDescription = (String) sprintRow[idx++];
            String departmentsStr = (String) sprintRow[idx++];

            // Calculate duration in days
            Integer durationDays = 0;
            if (startDate != null && endDate != null) {
                durationDays = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
            }

            // Get task status counts
            Object[] statusCounts = taskRepository.getTaskStatusCountsForUserInSprint(userId, sprintId);

            Integer totalTasks = convertToInteger(statusCounts[0]);
            Integer todoCount = convertToInteger(statusCounts[1]);
            Integer inProgressCount = convertToInteger(statusCounts[2]);
            Integer doneCount = convertToInteger(statusCounts[3]);
            Integer closedCount = convertToInteger(statusCounts[4]);
            String departmentsFromTasks = (String) statusCounts[5];

            // Build response DTOs
            SprintOverviewInfo sprintInfo = SprintOverviewInfo.builder()
                    .id(sprintIdFromDb)
                    .name(sprintName)
                    .startDate(startDate)
                    .endDate(endDate)
                    .durationDays(durationDays)
                    .build();

            ProjectOverviewInfo projectInfo = ProjectOverviewInfo.builder()
                    .id(projectId)
                    .name(projectName)
                    .build();

            TaskStatusSummary taskSummary = TaskStatusSummary.builder()
                    .totalTasks(totalTasks)
                    .todoCount(todoCount)
                    .inProgressCount(inProgressCount)
                    .doneCount(doneCount)
                    .closedCount(closedCount)
                    .build();

            // Parse departments from task data (more accurate than sprint data)
            List<String> departments = parseDepartments(departmentsFromTasks);

            AssigneeOverviewResponse response = AssigneeOverviewResponse.builder()
                    .sprint(sprintInfo)
                    .project(projectInfo)
                    .taskSummary(taskSummary)
                    .departments(departments)
                    .build();

            log.info("Successfully retrieved sprint overview for sprint {} and user: {}", sprintId, userId);

            return ApiResponse.success("Sprint overview retrieved successfully", response);

        } catch (Exception e) {
            log.error("Error fetching sprint overview for sprint {} and user: {}", sprintId, userId, e);
            return ApiResponse.error(
                    "Failed to fetch sprint overview",
                    "FETCH_OVERVIEW_ERROR",
                    "An error occurred while fetching sprint overview"
            );
        }
    }

    /**
     * Get timeline data for the authenticated user's assignee tasks in a sprint.
     */
    public ApiResponse<AssigneeTimelineResponse> getAssigneeTimeline(UUID sprintId, UUID userId) {
        try {
            Sprint sprint = sprintRepository.getUserSprint(userId, sprintId)
                    .orElse(null);

            if (sprint == null) {
                AssigneeTimelineResponse payload = AssigneeTimelineResponse.builder()
                        .sprintId(sprintId)
                        .startDate(null)
                        .endDate(null)
                        .holidays(List.of())
                        .tasks(List.of())
                        .build();
                return ApiResponse.success("Timeline retrieved successfully", payload);
            }

            AssigneeTimelineResponse payload = AssigneeTimelineResponse.builder()
                    .sprintId(sprint.getId())
                    .startDate(sprint.getStartDate())
                    .endDate(sprint.getEndDate())
                    .build();

            setTimelineTasks(userId, sprint, payload);

            return ApiResponse.success("Timeline retrieved successfully", payload);
        } catch (Exception e) {
            log.error("Error building assignee timeline for sprint {} and user {}", sprintId, userId, e);
            return ApiResponse.error("Failed to fetch timeline", "FETCH_TIMELINE_ERROR", "An error occurred while fetching timeline");
        }
    }

    private void setTimelineTasks(UUID userId, Sprint sprint, AssigneeTimelineResponse response) {
        Optional<List<Object[]>> userAssignee = userAssigneeRepository.getUserAssigneeBySprint(userId, sprint.getId());

        if (userAssignee.isEmpty() || userAssignee.get().isEmpty()) {
            return;
        }

        UUID assigneeId = (UUID) userAssignee.get().getFirst()[1];
        List<Task> tasks = taskRepository.findAssigneeTasksBySprint(assigneeId, sprint.getId());

        List<AssigneeTimelineResponse.TaskItem> taskItems = new ArrayList<>();
        LocalDate latestStartDate = sprint.getStartDate();

        for (Task task : tasks) {
            LocalDate tempStartDate = latestStartDate;

            AssigneeTimelineResponse.TaskItem taskItem = new AssigneeTimelineResponse.TaskItem();
            taskItem.setId(task.getId());
            taskItem.setCode(task.getCode());
            taskItem.setDescription(task.getDescription());
            taskItem.setStatus(task.getStatus().name());
            taskItem.setPriority(task.getPriority().name());
            taskItem.setAssigneeName(task.getAssignee().getName());
            taskItem.setDepartmentId(task.getDepartment().getId().toString());

            long totalWorkDays = new BigDecimal(task.getStoryPoints())
                    .divide(new BigDecimal(sprint.getStoryPointsPerDay()), 0, RoundingMode.HALF_UP)
                    .longValue();

            LocalDate endDate = tempStartDate.plusDays(totalWorkDays);

            LocalDate finalLatestStartDate = latestStartDate;
            List<LocalDate> holidays = sprint.getHolidaysAsDates()
                    .stream()
                    .filter(holiday -> holiday.isEqual(finalLatestStartDate) || holiday.isAfter(finalLatestStartDate))
                    .toList();

            if (holidays.isEmpty()) {
                taskItem.setStartDate(latestStartDate);
                taskItem.setEndDate(endDate);

                latestStartDate = endDate.plusDays(1L);
                continue;
            }

            long remainingWorkDays = totalWorkDays;
            for (LocalDate holiday : holidays) {
                if (remainingWorkDays == 0) {
                    break;
                }

                if (latestStartDate.isEqual(holiday)) {
                    latestStartDate = latestStartDate.plusDays(1);
                    tempStartDate =  tempStartDate.plusDays(1);
                    continue;
                }

                if (tempStartDate.isEqual(holiday)) {
                    tempStartDate = tempStartDate.plusDays(1L);
                    continue;
                }

                if (tempStartDate.isAfter(holiday)) {
                    continue;
                }

                endDate = holiday.minusDays(1L);
                long workDaysSpent = ChronoUnit.DAYS.between(tempStartDate, endDate) + 1;

                if (remainingWorkDays <= workDaysSpent) {
                    endDate = tempStartDate.plusDays(remainingWorkDays - 1);
                    remainingWorkDays = 0;
                } else {
                    remainingWorkDays = remainingWorkDays - workDaysSpent;
                    tempStartDate = holiday.plusDays(1L);
                }
            }

            taskItem.setStartDate(latestStartDate);
            taskItem.setEndDate(endDate);

            if (remainingWorkDays > 0) {
                taskItem.setEndDate(tempStartDate.plusDays(remainingWorkDays));
            }

            taskItems.add(taskItem);
            latestStartDate = endDate.plusDays(1L);
        }

        LocalDate maxTaskEndDate = taskItems.stream()
                .max((item1, item2) -> item2.getEndDate().compareTo(item1.getEndDate()))
                .map(AssigneeTimelineResponse.TaskItem::getEndDate)
                .orElse(null);

        if (maxTaskEndDate != null && maxTaskEndDate.isAfter(sprint.getEndDate())) {
            response.setEndDate(maxTaskEndDate);
        }

        response.setTasks(taskItems);
    }

}

