package com.scrumku.scrumapp.task.service;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.department.entity.Department;
import com.scrumku.scrumapp.master.department.repository.DepartmentRepository;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.sprint.entity.Sprint;
import com.scrumku.scrumapp.sprint.repository.SprintRepository;
import com.scrumku.scrumapp.task.dto.TaskReorderRequest;
import com.scrumku.scrumapp.task.dto.TaskRequest;
import com.scrumku.scrumapp.task.dto.TaskResponse;
import com.scrumku.scrumapp.task.entity.Task;
import com.scrumku.scrumapp.task.enums.ValidationMode;
import com.scrumku.scrumapp.task.repository.TaskCounterRepository;
import com.scrumku.scrumapp.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskCounterRepository taskCounterRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final AssigneeRepository assigneeRepository;
    private final DepartmentRepository departmentRepository;


    /**
     * Validates task data before creation or update.
     * This includes dependency validation and other business rules.
     *
     * @param task   The task to validate
     * @param mode   The validation mode (CREATE or UPDATE)
     * @param userId The user ID
     * @return ApiResponse with validation result
     */
    public ApiResponse<Boolean> validateTask(Task task, ValidationMode mode, UUID userId) {
        try {
            // 1. Validate project (must present and belong to the user)
            if (task.getProject() == null || task.getProject().getId() == null) {
                return ApiResponse.error("Project is required", "INVALID_PROJECT", "Project is required");
            }

            if (!projectRepository.existsByIdAndUserId(task.getProject().getId(), userId)) {
                return ApiResponse.error("Project not found or access denied", "PROJECT_ACCESS_DENIED", "Project not found or access denied");
            }

            // 2. Validate sprint (must present and exist and belong to the project)
            if (task.getSprint() == null || task.getSprint().getId() == null) {
                return ApiResponse.error("Sprint is required", "INVALID_SPRINT", "Sprint is required");
            }

            if (!sprintRepository.existsByIdAndProjectId(task.getSprint().getId(), task.getProject().getId())) {
                return ApiResponse.error("Sprint does not belong to the specified project", "INVALID_SPRINT_PROJECT", "Sprint does not belong to the specified project");
            }

            // 3. Validate description based on mode
            if (mode == ValidationMode.UPDATE) {
                // For update: description cannot be empty or null
                if (task.getDescription().trim().isEmpty()) {
                    return ApiResponse.error("Task description is required", "INVALID_TASK_DESCRIPTION", "Task description is required");
                }
            }

            // 4. Validate story points (not null and > 0)
            if (task.getStoryPoints() == null || task.getStoryPoints() <= 0) {
                return ApiResponse.error("Story points must be greater than 0", "INVALID_STORY_POINTS", "Story points must be greater than 0");
            }

            // 5. Validate status (not null and must match enum value)
            if (task.getStatus() == null) {
                return ApiResponse.error("Task status is required", "INVALID_TASK_STATUS", "Task status is required");
            }

            // 6. Validate priority (not null and must match enum value)
            if (task.getPriority() == null) {
                return ApiResponse.error("Task priority is required", "INVALID_TASK_PRIORITY", "Task priority is required");
            }

            // 7. Validate assignee if provided (optional)
            if (task.getAssignee() != null && task.getAssignee().getId() != null) {
                if (!assigneeRepository.existsByIdAndProjectId(task.getAssignee().getId(), task.getProject().getId())) {
                    return ApiResponse.error("Assignee does not belong to the specified project", "INVALID_ASSIGNEE_PROJECT", "Assignee does not belong to the specified project");
                }
            }

            // 8. Validate department if provided (optional)
            if (task.getDepartment() != null && task.getDepartment().getId() != null) {
                if (!departmentRepository.existsByIdAndProjectId(task.getDepartment().getId(), task.getProject().getId())) {
                    return ApiResponse.error("Department does not belong to the specified project", "INVALID_DEPARTMENT_PROJECT", "Department does not belong to the specified project");
                }
            }

            // 9. Validate dependency task if provided (optional)
            if (task.getDependencyTask() != null && task.getDependencyTask().getId() != null) {
                // Check if dependency task exists and belongs to the same project
                if (!taskRepository.existsByIdAndProjectId(task.getDependencyTask().getId(), task.getProject().getId())) {
                    return ApiResponse.error("Dependency task does not belong to the specified project", "INVALID_DEPENDENCY_TASK_PROJECT", "Dependency task does not belong to the specified project");
                }

                // Check for circular dependency
                if (task.getId() != null && wouldCreateCircularDependency(task.getId(), task.getDependencyTask().getId())) {
                    return ApiResponse.error("Circular dependency detected", "CIRCULAR_DEPENDENCY", "Cannot create circular dependency");
                }
            }

            return ApiResponse.success("Task validation successful", true);

        } catch (Exception e) {
            log.error("Error validating task", e);
            return ApiResponse.error("Failed to validate task", "TASK_VALIDATION_ERROR", "Failed to validate task");
        }
    }


    /**
     * Generates a unique task code for the project using atomic counter.
     * Format: {projectCode}-T{counter}
     * This method is thread-safe and prevents race conditions.
     *
     * @param projectCode The project code
     * @param projectId   The project ID
     * @return Generated task code
     */
    private String generateTaskCode(String projectCode, UUID projectId) {
        try {
            // Atomically increment counter and get the new value
            Integer counter = taskCounterRepository.incrementAndGetCounter(projectId, projectCode);

            return projectCode + "-T" + counter;

        } catch (Exception e) {
            log.error("Error generating task code for project {}", projectId, e);
            // Fallback to timestamp-based code
            return projectCode + "-T" + System.currentTimeMillis();
        }
    }

    // ==================== CRUD OPERATIONS ====================

    /**
     * Creates a new task.
     *
     * @param request   The task creation request
     * @param projectId The project ID
     * @param userId    The user ID
     * @return ApiResponse with the created task
     */
    public ApiResponse<TaskResponse> createTask(TaskRequest request, UUID projectId, UUID userId) {
        try {
            // Get project and sprint entities
            Optional<Project> projectOpt = projectRepository.findById(projectId);
            if (projectOpt.isEmpty()) {
                return ApiResponse.error("Project not found", "PROJECT_NOT_FOUND", "Project not found");
            }

            Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
            if (sprintOpt.isEmpty()) {
                return ApiResponse.error("Sprint not found", "SPRINT_NOT_FOUND", "Sprint not found");
            }

            // Build task entity
            Task task = request.toEntity();
            task.setProject(projectOpt.get());
            task.setSprint(sprintOpt.get());

            // Generate task code
            String taskCode = generateTaskCode(projectOpt.get().getCode(), projectId);
            task.setCode(taskCode);

            // Set assignee if provided
            if (request.getAssigneeId() != null) {
                Optional<Assignee> assigneeOpt = assigneeRepository.findById(request.getAssigneeId());
                if (assigneeOpt.isEmpty()) {
                    return ApiResponse.error("Assignee not found", "ASSIGNEE_NOT_FOUND", "Assignee not found");
                }
                task.setAssignee(assigneeOpt.get());
            }

            // Set department if provided
            if (request.getDepartmentId() != null) {
                Optional<Department> departmentOpt = departmentRepository.findById(request.getDepartmentId());
                if (departmentOpt.isEmpty()) {
                    return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
                }
                task.setDepartment(departmentOpt.get());
            }

            // Set dependency if provided
            if (request.getDependencyTaskId() != null) {
                Optional<Task> dependencyOpt = taskRepository.findByIdAndProjectId(request.getDependencyTaskId(), projectId);
                if (dependencyOpt.isEmpty()) {
                    return ApiResponse.error("Dependency task not found", "DEPENDENCY_TASK_NOT_FOUND", "Dependency task not found");
                }
                task.setDependencyTask(dependencyOpt.get());
            }

            // Validate task
            ApiResponse<Boolean> validation = validateTask(task, ValidationMode.CREATE, userId);
            if (!validation.getSuccess() || !validation.getData()) {
                return ApiResponse.error(validation.getMessage(), validation.getError().getCode(), validation.getError().getMessage());
            }

            // Set task order (grouped by sprint only)
            Integer maxOrder = taskRepository.getMaxTaskOrderForSprint(request.getSprintId());
            task.setTaskOrder(maxOrder + 1);

            // Save task
            Task savedTask = taskRepository.save(task);
            TaskResponse response = TaskResponse.fromEntity(savedTask);

            return ApiResponse.success("Task created successfully", response);

        } catch (Exception e) {
            log.error("Error creating task", e);
            return ApiResponse.error("Failed to create task", "TASK_CREATION_ERROR", "Failed to create task");
        }
    }

    /**
     * Updates an existing task.
     *
     * @param taskId    The task ID
     * @param request   The task update request
     * @param projectId The project ID
     * @param userId    The user ID
     * @return ApiResponse with the updated task
     */
    public ApiResponse<TaskResponse> updateTask(UUID taskId, TaskRequest request, UUID projectId, UUID userId) {
        try {
            // Get existing task
            Optional<Task> existingTaskOpt = taskRepository.findByIdAndProjectId(taskId, projectId);
            if (existingTaskOpt.isEmpty()) {
                return ApiResponse.error("Task not found", "TASK_NOT_FOUND", "Task not found");
            }

            Task existingTask = existingTaskOpt.get();

            // Get sprint entity
            Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
            if (sprintOpt.isEmpty()) {
                return ApiResponse.error("Sprint not found", "SPRINT_NOT_FOUND", "Sprint not found");
            }

            // Update task fields (code cannot be changed)
            existingTask.setDescription(request.getDescription());
            existingTask.setStoryPoints(request.getStoryPoints());
            existingTask.setStatus(request.getStatus());
            existingTask.setPriority(request.getPriority());
            existingTask.setSprint(sprintOpt.get());

            // Update assignee
            if (request.getAssigneeId() != null) {
                Optional<Assignee> assigneeOpt = assigneeRepository.findById(request.getAssigneeId());
                if (assigneeOpt.isEmpty()) {
                    return ApiResponse.error("Assignee not found", "ASSIGNEE_NOT_FOUND", "Assignee not found");
                }
                existingTask.setAssignee(assigneeOpt.get());
            } else {
                existingTask.setAssignee(null);
            }

            // Update department
            if (request.getDepartmentId() != null) {
                Optional<Department> departmentOpt = departmentRepository.findById(request.getDepartmentId());
                if (departmentOpt.isEmpty()) {
                    return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
                }
                existingTask.setDepartment(departmentOpt.get());
            } else {
                existingTask.setDepartment(null);
            }

            // Update dependency
            if (request.getDependencyTaskId() != null) {
                Optional<Task> dependencyOpt = taskRepository.findByIdAndProjectId(request.getDependencyTaskId(), projectId);
                if (dependencyOpt.isEmpty()) {
                    return ApiResponse.error("Dependency task not found", "DEPENDENCY_TASK_NOT_FOUND", "Dependency task not found");
                }
                existingTask.setDependencyTask(dependencyOpt.get());
            } else {
                existingTask.setDependencyTask(null);
            }

            // Validate task
            ApiResponse<Boolean> validation = validateTask(existingTask, ValidationMode.UPDATE, userId);
            if (!validation.getSuccess() || !validation.getData()) {
                return ApiResponse.error(validation.getMessage(), validation.getError().getCode(), validation.getError().getMessage());
            }

            // Save task
            Task savedTask = taskRepository.save(existingTask);
            TaskResponse response = TaskResponse.fromEntity(savedTask);

            return ApiResponse.success("Task updated successfully", response);

        } catch (Exception e) {
            log.error("Error updating task", e);
            return ApiResponse.error("Failed to update task", "TASK_UPDATE_ERROR", "Failed to update task");
        }
    }


    /**
     * Gets tasks by sprint.
     *
     * @param sprintId  The sprint ID
     * @param projectId The project ID
     * @param userId    The user ID
     * @return ApiResponse with the task list
     */
    public ApiResponse<List<TaskResponse>> getTasksBySprint(UUID sprintId, UUID projectId, UUID userId) {
        try {
            // Validate project ownership
            if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
                return ApiResponse.error("Project not found or access denied", "PROJECT_ACCESS_DENIED", "Project not found or access denied");
            }

            // Validate sprint belongs to project
            if (!sprintRepository.existsByIdAndProjectId(sprintId, projectId)) {
                return ApiResponse.error("Sprint does not belong to the specified project", "INVALID_SPRINT_PROJECT", "Sprint does not belong to the specified project");
            }

            List<Task> tasks = taskRepository.findBySprintId(sprintId);

            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::fromEntity)
                    .collect(Collectors.toList());

            return ApiResponse.success("Tasks retrieved successfully", taskResponses);

        } catch (Exception e) {
            log.error("Error getting tasks by sprint", e);
            return ApiResponse.error("Failed to get tasks", "TASKS_GET_ERROR", "Failed to get tasks");
        }
    }

    /**
     * Deletes a task.
     *
     * @param taskId    The task ID
     * @param projectId The project ID
     * @param userId    The user ID
     * @return ApiResponse with success status
     */
    public ApiResponse<Boolean> deleteTask(UUID taskId, UUID projectId, UUID userId) {
        try {
            // Validate project ownership
            if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
                return ApiResponse.error("Project not found or access denied", "PROJECT_ACCESS_DENIED", "Project not found or access denied");
            }

            Optional<Task> taskOpt = taskRepository.findByIdAndProjectId(taskId, projectId);
            if (taskOpt.isEmpty()) {
                return ApiResponse.error("Task not found", "TASK_NOT_FOUND", "Task not found");
            }

            // Check if task has dependents
            List<Task> dependentTasks = taskRepository.findDependentTasks(taskId);
            if (!dependentTasks.isEmpty()) {
                return ApiResponse.error("Cannot delete task with dependent tasks", "TASK_HAS_DEPENDENTS", "Cannot delete task with dependent tasks");
            }

            taskRepository.deleteById(taskId);
            return ApiResponse.success("Task deleted successfully", true);

        } catch (Exception e) {
            log.error("Error deleting task", e);
            return ApiResponse.error("Failed to delete task", "TASK_DELETE_ERROR", "Failed to delete task");
        }
    }

    /**
     * Reorders tasks within a sprint.
     *
     * @param request   The reorder request
     * @param projectId The project ID
     * @param userId    The user ID
     * @return ApiResponse with success status
     */
    public ApiResponse<Boolean> reorderTasks(TaskReorderRequest request, UUID projectId, UUID userId) {
        try {
            // Validate project ownership
            if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
                return ApiResponse.error("Project not found or access denied", "PROJECT_ACCESS_DENIED", "Project not found or access denied");
            }

            // Validate all tasks belong to the project
            for (TaskReorderRequest.TaskOrderItem item : request.getTaskOrders()) {
                UUID taskId = UUID.fromString(item.getTaskId());
                if (!taskRepository.existsByIdAndProjectId(taskId, projectId)) {
                    return ApiResponse.error("Task not found or access denied", "TASK_ACCESS_DENIED", "Task not found or access denied");
                }
            }

            // Update task orders
            List<Object[]> taskOrders = request.getTaskOrders().stream()
                    .map(item -> new Object[]{UUID.fromString(item.getTaskId()), item.getTaskOrder()})
                    .collect(Collectors.toList());

            taskRepository.updateTaskOrders(taskOrders);

            return ApiResponse.success("Tasks reordered successfully", true);

        } catch (Exception e) {
            log.error("Error reordering tasks", e);
            return ApiResponse.error("Failed to reorder tasks", "TASK_REORDER_ERROR", "Failed to reorder tasks");
        }
    }

    // ==================== CIRCULAR DEPENDENCY DETECTION ====================

    /**
     * Checks if setting a dependency would create a circular dependency using Java-based DFS.
     * This method is more reliable and database-agnostic compared to the SQL-based approach.
     *
     * @param taskId           The ID of the task that would have the dependency
     * @param dependencyTaskId The ID of the task that would be the dependency
     * @return true if the dependency would create a circular dependency, false otherwise
     */
    public boolean wouldCreateCircularDependency(UUID taskId, UUID dependencyTaskId) {
        if (taskId == null || dependencyTaskId == null || taskId.equals(dependencyTaskId)) {
            return true; // Invalid dependency
        }

        // Use Java-based DFS to check for circular dependency
        return hasPathToTask(dependencyTaskId, taskId);
    }

    /**
     * Checks if there's a path from sourceTaskId to targetTaskId using Depth-First Search.
     * This method is used for circular dependency detection.
     *
     * @param sourceTaskId The ID of the source task
     * @param targetTaskId The ID of the target task
     * @return true if there's a path from source to target, false otherwise
     */
    private boolean hasPathToTask(UUID sourceTaskId, UUID targetTaskId) {
        if (sourceTaskId == null || targetTaskId == null || sourceTaskId.equals(targetTaskId)) {
            return false;
        }

        Set<UUID> visited = new HashSet<>();
        return dfsHasPathToTask(sourceTaskId, targetTaskId, visited);
    }

    /**
     * Recursive helper method for DFS path checking.
     *
     * @param currentTaskId The current task ID being visited
     * @param targetTaskId  The target task ID to find
     * @param visited       Set of already visited task IDs to prevent infinite loops
     * @return true if there's a path from current to target, false otherwise
     */
    private boolean dfsHasPathToTask(UUID currentTaskId, UUID targetTaskId, Set<UUID> visited) {
        if (currentTaskId.equals(targetTaskId)) {
            return true;
        }

        if (visited.contains(currentTaskId)) {
            return false; // Already visited, no path found
        }

        visited.add(currentTaskId);

        // Get the current task and its dependency
        Task currentTask = taskRepository.getTaskWithDependency(currentTaskId);
        if (currentTask == null || currentTask.getDependencyTask() == null) {
            return false; // No dependency, no path
        }

        // Recursively check the dependency chain
        return dfsHasPathToTask(currentTask.getDependencyTask().getId(), targetTaskId, visited);
    }
}
