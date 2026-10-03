package com.scrumku.scrumapp.assignee.controller;

import com.scrumku.scrumapp.assignee.dto.*;
import com.scrumku.scrumapp.assignee.service.AssigneeSprintService;
import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/private/v1/assignee")
@RequiredArgsConstructor
public class AssigneeSprintController {

    private final AssigneeSprintService assigneeSprintService;

    /**
     * Get all sprints for the authenticated user's assignee roles
     * @return List of sprints with project and department information
     */
    @GetMapping("/sprints")
    public ResponseEntity<ApiResponse<AssigneeSprintListResponse>> getAssigneeSprints() {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to get assignee sprints for user: {}", userId);

        ApiResponse<AssigneeSprintListResponse> response = assigneeSprintService.getAssigneeSprints(userId);

        int statusCode = response.getSuccess() ? 200 : 400;
        return ResponseEntity.status(statusCode).body(response);
    }
    
    /**
     * Get a specific sprint by ID for the authenticated user
     * @param sprintId The sprint ID
     * @return Sprint details with project and department information
     */
    @GetMapping("/sprints/{sprintId}")
    public ResponseEntity<ApiResponse<com.scrumku.scrumapp.assignee.dto.AssigneeSprintItem>> getAssigneeSprintById(
            @PathVariable UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to get sprint {} for user: {}", sprintId, userId);

        ApiResponse<com.scrumku.scrumapp.assignee.dto.AssigneeSprintItem> response = 
                assigneeSprintService.getAssigneeSprintById(sprintId, userId);

        int statusCode = response.getSuccess() ? 200 : (response.getError() != null && 
                "SPRINT_NOT_FOUND".equals(response.getError().getCode()) ? 404 : 400);
        return ResponseEntity.status(statusCode).body(response);
    }

    /**
     * Get sprint overview data for assignee dashboard
     * @param sprintId The sprint ID
     * @return Sprint overview with task status summary and department information
     */
    @GetMapping("/sprints/{sprintId}/overview")
    public ResponseEntity<ApiResponse<AssigneeOverviewResponse>> getAssigneeSprintOverview(
            @PathVariable UUID sprintId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to get sprint overview for sprint {} and user: {}", sprintId, userId);

        ApiResponse<AssigneeOverviewResponse> response = 
                assigneeSprintService.getAssigneeSprintOverview(sprintId, userId);

        int statusCode = response.getSuccess() ? 200 : (response.getError() != null && 
                "SPRINT_NOT_FOUND".equals(response.getError().getCode()) ? 404 : 400);
        return ResponseEntity.status(statusCode).body(response);
    }

    /**
     * Get paginated tasks for assignee role in a sprint
     * Query params: limit (default 5), cursor (opaque)
     */
    @GetMapping("/sprints/{sprintId}/tasks")
    public ResponseEntity<ApiResponse<AssigneeTasksResponse>> getAssigneeTasks(
            @PathVariable UUID sprintId,
            @RequestParam(name = "limit", defaultValue = "5") int limit,
            @RequestParam(name = "cursor", required = false) String cursor) {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to get tasks for sprint {} and user: {} with limit {} and cursor {}", sprintId, userId, limit, cursor);

        ApiResponse<AssigneeTasksResponse> response = assigneeSprintService.getAssigneeTasks(sprintId, userId, limit, cursor);
        int statusCode = response.getSuccess() ? 200 : 400;
        return ResponseEntity.status(statusCode).body(response);
    }

    /**
     * Update task status for assignee role
     * Body: { "status": "TODO" | "IN_PROGRESS" | "DONE" | "CLOSED" }
     */
    @PatchMapping("/sprints/{sprintId}/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<Void>> updateAssigneeTaskStatus(
            @PathVariable UUID sprintId,
            @PathVariable UUID taskId,
            @RequestBody StatusUpdateRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        log.info("Received request to update task {} status to {} for sprint {} and user {}", taskId, request.getStatus(), sprintId, userId);

        ApiResponse<Void> response = assigneeSprintService.updateAssigneeTaskStatus(
                sprintId,
                taskId,
                userId,
                com.scrumku.scrumapp.task.entity.Task.TaskStatus.valueOf(request.getStatus())
        );
        int statusCode = response.getSuccess() ? 200 : (response.getError() != null &&
                "TASK_NOT_FOUND".equals(response.getError().getCode()) ? 404 : 400);
        return ResponseEntity.status(statusCode).body(response);
    }

  /**
   * Get timeline data for assignee role in a sprint
   */
  @GetMapping("/sprints/{sprintId}/timeline")
  public ResponseEntity<ApiResponse<AssigneeTimelineResponse>> getAssigneeTimeline(
          @PathVariable UUID sprintId) {
      UUID userId = SecurityUtils.getCurrentUserId();
      log.info("Received request to get timeline for sprint {} and user {}", sprintId, userId);

      ApiResponse<AssigneeTimelineResponse> response = assigneeSprintService.getAssigneeTimeline(sprintId, userId);
      int statusCode = response.getSuccess() ? 200 : 400;
      return ResponseEntity.status(statusCode).body(response);
  }

}

