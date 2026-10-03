package com.scrumku.scrumapp.task.repository;

import com.scrumku.scrumapp.task.entity.Task;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Repository
public class TaskRepository extends SimpleJpaRepository<Task, UUID> {

    @PersistenceContext
    private EntityManager entityManager;

    public TaskRepository(EntityManager entityManager) {
        super(Task.class, entityManager);
    }

    // JPA methods for CUD operations
    @SuppressWarnings("unchecked")
    public List<Task> findByProjectId(UUID projectId) {
        String jpql = "SELECT t FROM Task t WHERE t.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Task.class);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Task> findBySprintId(UUID sprintId) {
        String jpql = "SELECT t FROM Task t WHERE t.sprint.id = :sprintId ORDER BY t.createdAt DESC";
        Query query = entityManager.createQuery(jpql, Task.class);
        query.setParameter("sprintId", sprintId);
        return query.getResultList();
    }

    public Optional<Task> findByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT t FROM Task t WHERE t.id = :id AND t.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Task.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        try {
            return Optional.of((Task) query.getSingleResult());
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public boolean existsByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT COUNT(t) > 0 FROM Task t WHERE t.id = :id AND t.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }

    public boolean existsByCodeAndProjectId(String code, UUID projectId) {
        String jpql = "SELECT COUNT(t) > 0 FROM Task t WHERE t.code = :code AND t.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("code", code);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }

    // Dependency validation methods

    /**
     * Finds all tasks that depend on the given task (i.e., tasks that have this task as their dependency).
     * This is used for circular dependency validation.
     *
     * @param taskId The ID of the task to find dependents for
     * @return List of tasks that depend on the given task
     */
    @SuppressWarnings("unchecked")
    public List<Task> findDependentTasks(UUID taskId) {
        String jpql = "SELECT t FROM Task t WHERE t.dependencyTask.id = :taskId";
        Query query = entityManager.createQuery(jpql, Task.class);
        query.setParameter("taskId", taskId);
        return query.getResultList();
    }

    /**
     * Finds all tasks in the dependency chain of a given task using a recursive CTE query.
     * This is more efficient than the entity-level recursive method for large dependency chains.
     *
     * @param taskId The ID of the task to find the dependency chain for
     * @return List of task IDs in the dependency chain (excluding the given task)
     */
    @SuppressWarnings("unchecked")
    public List<UUID> findDependencyChainIds(UUID taskId) {
        String sql = """
                WITH RECURSIVE DEPENDENCY_CHAIN AS (
                    -- Base case: start with the given task
                    SELECT ID, DEPENDENCY_TASK_ID, 1 AS DEPTH
                    FROM TASKS 
                    WHERE ID = :taskId
                
                    UNION ALL
                
                    -- Recursive case: follow the dependency chain
                    SELECT T.ID, T.DEPENDENCY_TASK_ID, DC.DEPTH + 1
                    FROM TASKS T
                    INNER JOIN DEPENDENCY_CHAIN DC ON T.ID = DC.DEPENDENCY_TASK_ID
                    WHERE DC.DEPTH < 100 -- Prevent infinite recursion (max 100 levels)
                )
                SELECT ID FROM DEPENDENCY_CHAIN WHERE ID != :taskId
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("taskId", taskId);
        return query.getResultList();
    }

    /**
     * Checks if setting a dependency would create a circular dependency.
     * This method performs the validation at the database level for efficiency.
     *
     * @param taskId           The ID of the task that would have the dependency
     * @param dependencyTaskId The ID of the task that would be the dependency
     * @return true if the dependency would create a circular dependency, false otherwise
     */
    public boolean wouldCreateCircularDependency(UUID taskId, UUID dependencyTaskId) {
        if (taskId == null || dependencyTaskId == null || taskId.equals(dependencyTaskId)) {
            return true; // Invalid dependency
        }

        // Check if the dependency task is in the dependency chain of the current task
        String sql = """
                WITH RECURSIVE DEPENDENCY_CHAIN AS (
                    -- Base case: start with the current task
                    SELECT ID, DEPENDENCY_TASK_ID, 1 AS DEPTH
                    FROM TASKS 
                    WHERE ID = :taskId
                
                    UNION ALL
                
                    -- Recursive case: follow the dependency chain
                    SELECT T.ID, T.DEPENDENCY_TASK_ID, DC.DEPTH + 1
                    FROM TASKS T
                    INNER JOIN DEPENDENCY_CHAIN DC ON T.ID = DC.DEPENDENCY_TASK_ID
                    WHERE DC.DEPTH < 100 -- Prevent infinite recursion
                )
                SELECT COUNT(*) > 0 FROM DEPENDENCY_CHAIN WHERE ID = :dependencyTaskId
                """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("taskId", taskId);
        query.setParameter("dependencyTaskId", dependencyTaskId);

        try {
            return Boolean.TRUE.equals(query.getSingleResult());
        } catch (Exception e) {
            log.error("Error checking circular dependency for task {} and dependency {}", taskId, dependencyTaskId, e);
            return true; // Assume circular dependency on error to be safe
        }
    }

    /**
     * Gets the maximum task order for a given sprint.
     * Task order is grouped by sprint only, so all tasks in a sprint share the same order sequence.
     * This is used when creating new tasks to assign the next order number.
     *
     * @param sprintId The ID of the sprint
     * @return The maximum task order, or 0 if no tasks exist
     */
    public Integer getMaxTaskOrderForSprint(UUID sprintId) {
        String jpql = "SELECT COALESCE(MAX(t.taskOrder), 0) FROM Task t WHERE t.sprint.id = :sprintId";
        Query query = entityManager.createQuery(jpql, Integer.class);
        query.setParameter("sprintId", sprintId);
        return (Integer) query.getSingleResult();
    }

    /**
     * Updates task orders for a batch of tasks.
     * This is used for drag-and-drop reordering functionality.
     *
     * @param taskOrders List of arrays containing [taskId, taskOrder]
     */
    public void updateTaskOrders(List<Object[]> taskOrders) {
        String sql = "UPDATE TASKS SET TASK_ORDER = ? WHERE ID = ?";

        for (Object[] taskOrder : taskOrders) {
            UUID taskId = (UUID) taskOrder[0];
            Integer order = (Integer) taskOrder[1];

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, order);
            query.setParameter(2, taskId);
            query.executeUpdate();
        }
    }

    /**
     * Gets a task with its dependency for circular dependency detection.
     *
     * @param taskId The task ID
     * @return Task with dependency, or null if not found
     */
    public Task getTaskWithDependency(UUID taskId) {
        // Use JPA query instead of native query for better entity mapping
        String jpql = "SELECT t FROM Task t LEFT JOIN FETCH t.dependencyTask WHERE t.id = :taskId";
        Query query = entityManager.createQuery(jpql, Task.class);
        query.setParameter("taskId", taskId);

        try {
            return (Task) query.getSingleResult();
        } catch (NoResultException e) {
            return null;
        } catch (Exception e) {
            log.error("Error getting task with dependency for task: {}", taskId, e);
            return null;
        }
    }

    /**
     * Find tasks for dropdown by project and sprint
     *
     * @param projectId The project ID
     * @param sprintId  The sprint ID
     * @return List of task data for dropdown
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findTasksForDropdownNative(UUID projectId, UUID sprintId) {
        String sql = """
                SELECT T.ID, T.CODE, T.DESCRIPTION
                FROM TASKS T 
                WHERE T.PROJECT_ID = :projectId AND T.SPRINT_ID = :sprintId
                ORDER BY T.CODE ASC
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        query.setParameter("sprintId", sprintId);
        return query.getResultList();
    }

    /**
     * Get department tasks with summary data
     */
    public List<Object[]> getDepartmentTasksNative(UUID departmentId, UUID sprintId) {
        String sql = """
                SELECT T.ID, T.CODE, T.DESCRIPTION, A.NAME AS ASSIGNEE_NAME, 
                       T.PRIORITY, T.STORY_POINTS,
                       (T.STORY_POINTS::DECIMAL / S.STORY_POINTS_PER_DAY) AS DAYS_SPENT
                FROM TASKS T
                LEFT JOIN ASSIGNEES A ON T.ASSIGNEE_ID = A.ID
                JOIN SPRINTS S ON T.SPRINT_ID = S.ID
                WHERE T.DEPARTMENT_ID = :departmentId 
                AND T.SPRINT_ID = :sprintId
                ORDER BY 
                  CASE T.PRIORITY 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    WHEN 'LOW' THEN 3 
                  END,
                  T.CREATED_AT ASC
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        query.setParameter("sprintId", sprintId);
        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results;
    }

    /**
     * Get total story points for department tasks
     */
    public Long getDepartmentStoryPointsNative(UUID departmentId, UUID sprintId) {
        String sql = """
                SELECT COALESCE(SUM(T.STORY_POINTS), 0) AS TOTAL_STORY_POINTS
                FROM TASKS T
                WHERE T.DEPARTMENT_ID = :departmentId 
                AND T.SPRINT_ID = :sprintId
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        query.setParameter("sprintId", sprintId);
        return ((Number) query.getSingleResult()).longValue();
    }

    /**
     * Get total story points for all department member tasks
     */
    public Long getDepartmentMemberStoryPointsNative(UUID departmentId, UUID sprintId) {
        String sql = """
                SELECT COALESCE(SUM(T.STORY_POINTS), 0) AS TOTAL_MEMBER_STORY_POINTS
                FROM TASKS T
                JOIN DEPARTMENT_MEMBERS DM ON T.ASSIGNEE_ID = DM.ASSIGNEE_ID
                WHERE DM.DEPARTMENT_ID = :departmentId 
                AND T.SPRINT_ID = :sprintId
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        query.setParameter("sprintId", sprintId);
        return ((Number) query.getSingleResult()).longValue();
    }

    /**
     * Get assignee tasks with summary data
     */
    public List<Object[]> getAssigneeTasksNative(UUID assigneeId, UUID sprintId) {
        String sql = """
                SELECT T.ID, T.CODE, T.DESCRIPTION, DT.CODE,
                       T.PRIORITY, T.STATUS, T.STORY_POINTS, T.TASK_ORDER,
                       (T.STORY_POINTS::DECIMAL / S.STORY_POINTS_PER_DAY) AS DAYS_SPENT
                FROM TASKS T
                    LEFT JOIN TASKS DT ON T.DEPENDENCY_TASK_ID = DT.ID
                    INNER JOIN SPRINTS S ON T.SPRINT_ID = S.ID
                WHERE T.ASSIGNEE_ID = :assigneeId
                AND T.SPRINT_ID = :sprintId
                ORDER BY T.TASK_ORDER
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("assigneeId", assigneeId);
        query.setParameter("sprintId", sprintId);
        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results;
    }

    /**
     * Get total story points for assignee tasks
     */
    public Long getAssigneeStoryPointsNative(UUID assigneeId, UUID sprintId) {
        String sql = """
                SELECT COALESCE(SUM(T.STORY_POINTS), 0) AS TOTAL_STORY_POINTS
                FROM TASKS T
                WHERE T.ASSIGNEE_ID = :assigneeId 
                AND T.SPRINT_ID = :sprintId
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("assigneeId", assigneeId);
        query.setParameter("sprintId", sprintId);
        return ((Number) query.getSingleResult()).longValue();
    }

    @SuppressWarnings("unchecked")
    public List<Task> findAssigneeTasksBySprint(UUID assigneeId, UUID sprintId) {
        String sql = """
                  SELECT T.*
                  FROM ASSIGNEES A
                           INNER JOIN TASKS T ON A.ID = T.ASSIGNEE_ID
                           INNER JOIN SPRINTS S ON T.SPRINT_ID = S.ID
                  WHERE A.ID = :assigneeId
                    AND S.ID = :sprintId
                  ORDER BY
                      T.TASK_ORDER,
                      CASE T.PRIORITY
                          WHEN 'HIGH' THEN 1
                          WHEN 'MEDIUM' THEN 2
                          WHEN 'LOW' THEN 3
                        END,
                      T.CREATED_AT
                """;

        Query query = entityManager.createNativeQuery(sql, Task.class);
        query.setParameter("assigneeId", assigneeId);
        query.setParameter("sprintId", sprintId);

        return query.getResultList();
    }
    
    /**
     * Paged tasks for user's assignees within a sprint using cursor tuple (order, priority_rank, created_at, id)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findUserAssigneeTasksPagedNative(UUID userId, UUID sprintId,
                                                           int limit,
                                                           Integer afterOrder,
                                                           Integer afterPriorityRank,
                                                           java.time.OffsetDateTime afterCreatedAt,
                                                           UUID afterId) {
        String sql = """
                WITH user_tasks AS (
                    SELECT 
                        t.id,
                        t.code,
                        t.description,
                        t.story_points,
                        t.status,
                        t.priority,
                        t.task_order,
                        t.created_at,
                        COALESCE(dt.code, '') AS dependency_code,
                        d.name AS department_name,
                        CASE t.priority 
                            WHEN 'HIGH' THEN 1 
                            WHEN 'MEDIUM' THEN 2 
                            WHEN 'LOW' THEN 3 
                            ELSE 4 END AS priority_rank
                    FROM user_assignees ua
                    JOIN tasks t ON ua.assignee_id = t.assignee_id
                    LEFT JOIN tasks dt ON t.dependency_task_id = dt.id
                    LEFT JOIN departments d ON t.department_id = d.id
                    WHERE ua.user_id = :userId
                      AND t.sprint_id = :sprintId
                      AND t.status <> 'CLOSED'
                )
                SELECT 
                    id, code, description, story_points, status, priority, task_order, created_at,
                    dependency_code, department_name, priority_rank
                FROM user_tasks
                """;

        // Apply cursor conditions if present
        if (afterOrder != null && afterPriorityRank != null && afterCreatedAt != null && afterId != null) {
            sql += "\nWHERE (task_order, priority_rank, created_at, id) > (:afterOrder, :afterPriorityRank, :afterCreatedAt, :afterId)";
        }

        sql += "\nORDER BY task_order ASC, priority_rank ASC, created_at ASC, id ASC\nLIMIT :limit";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("userId", userId);
        query.setParameter("sprintId", sprintId);
        query.setParameter("limit", limit);

        if (afterOrder != null && afterPriorityRank != null && afterCreatedAt != null && afterId != null) {
            query.setParameter("afterOrder", afterOrder);
            query.setParameter("afterPriorityRank", afterPriorityRank);
            query.setParameter("afterCreatedAt", java.sql.Timestamp.from(afterCreatedAt.toInstant()));
            query.setParameter("afterId", afterId);
        }

        return query.getResultList();
    }

    /**
     * Update task status for a task accessible by the user (via user_assignees) within sprint.
     * Returns number of rows updated (0 when not allowed/not found).
     */
    public int updateTaskStatusForUser(UUID userId, UUID sprintId, UUID taskId, String status) {
        String sql = """
                UPDATE tasks t
                SET status = :status,
                    updated_at = NOW()
                FROM user_assignees ua
                WHERE t.id = :taskId
                  AND t.sprint_id = :sprintId
                  AND ua.assignee_id = t.assignee_id
                  AND ua.user_id = :userId
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("status", status);
        query.setParameter("taskId", taskId);
        query.setParameter("sprintId", sprintId);
        query.setParameter("userId", userId);
        return query.executeUpdate();
    }

    /**
     * Get task status counts for a user's assignees in a specific sprint
     * Returns: total_tasks, todo_count, in_progress_count, done_count, closed_count, departments (comma-separated)
     */
    public Object[] getTaskStatusCountsForUserInSprint(UUID userId, UUID sprintId) {
        String sql = """
                SELECT 
                    COUNT(t.id) AS total_tasks,
                    COUNT(CASE WHEN t.status = 'TODO' THEN 1 END) AS todo_count,
                    COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) AS in_progress_count,
                    COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) AS done_count,
                    COUNT(CASE WHEN t.status = 'CLOSED' THEN 1 END) AS closed_count,
                    STRING_AGG(DISTINCT d.name, ', ' ORDER BY d.name) AS departments
                FROM user_assignees ua
                INNER JOIN assignees a ON ua.assignee_id = a.id
                INNER JOIN tasks t ON a.id = t.assignee_id
                LEFT JOIN departments d ON t.department_id = d.id
                WHERE ua.user_id = :userId 
                AND t.sprint_id = :sprintId
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("userId", userId);
        query.setParameter("sprintId", sprintId);
        return (Object[]) query.getSingleResult();
    }
}
