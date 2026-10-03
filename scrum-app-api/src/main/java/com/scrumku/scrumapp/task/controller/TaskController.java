package com.scrumku.scrumapp.task.controller;

import com.scrumku.scrumapp.auth.util.SecurityUtils;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.task.dto.TaskRequest;
import com.scrumku.scrumapp.task.dto.TaskResponse;
import com.scrumku.scrumapp.task.dto.TaskReorderRequest;
import com.scrumku.scrumapp.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/private/v1/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Creates a new task.
     * 
     * @param projectId The project ID
     * @param request The task creation request
     * @return ResponseEntity with the created task
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable UUID projectId,
            @Valid @RequestBody TaskRequest request) {
        
        log.info("Creating task for project: {}", projectId);
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<TaskResponse> response = taskService.createTask(request, projectId, userId);
        
        if (response.getSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Updates an existing task.
     * 
     * @param projectId The project ID
     * @param taskId The task ID
     * @param request The task update request
     * @return ResponseEntity with the updated task
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskRequest request) {
        
        log.info("Updating task {} for project: {}", taskId, projectId);
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<TaskResponse> response = taskService.updateTask(taskId, request, projectId, userId);
        
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }


    /**
     * Gets tasks by sprint.
     * 
     * @param projectId The project ID
     * @param sprintId The sprint ID
     * @return ResponseEntity with the task list
     */
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksBySprint(
            @PathVariable UUID projectId,
            @PathVariable UUID sprintId) {
        
        log.info("Getting tasks for sprint {} in project: {}", sprintId, projectId);
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<List<TaskResponse>> response = taskService.getTasksBySprint(sprintId, projectId, userId);
        
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Deletes a task.
     * 
     * @param projectId The project ID
     * @param taskId The task ID
     * @return ResponseEntity with success status
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Boolean>> deleteTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId) {
        
        log.info("Deleting task {} for project: {}", taskId, projectId);
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Boolean> response = taskService.deleteTask(taskId, projectId, userId);
        
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Reorders tasks within a sprint.
     * 
     * @param projectId The project ID
     * @param request The reorder request
     * @return ResponseEntity with success status
     */
    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Boolean>> reorderTasks(
            @PathVariable UUID projectId,
            @Valid @RequestBody TaskReorderRequest request) {
        
        log.info("Reordering tasks for project: {}", projectId);
        UUID userId = SecurityUtils.getCurrentUserId();
        ApiResponse<Boolean> response = taskService.reorderTasks(request, projectId, userId);
        
        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

}
