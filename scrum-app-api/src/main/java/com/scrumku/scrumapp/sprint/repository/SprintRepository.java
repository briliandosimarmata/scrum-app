package com.scrumku.scrumapp.sprint.repository;

import com.scrumku.scrumapp.sprint.entity.Sprint;
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

@Slf4j
@Repository
public class SprintRepository extends SimpleJpaRepository<Sprint, UUID> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public SprintRepository(EntityManager entityManager) {
        super(Sprint.class, entityManager);
    }
    
    // JPA methods for CUD operations
    @SuppressWarnings("unchecked")
    public List<Sprint> findByProjectIdOrderByCreatedAtAsc(UUID projectId) {
        String jpql = "SELECT s FROM Sprint s WHERE s.project.id = :projectId ORDER BY s.createdAt ASC";
        Query query = entityManager.createQuery(jpql, Sprint.class);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    public Optional<Sprint> findByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT s FROM Sprint s WHERE s.id = :id AND s.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Sprint.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        
        try {
            Sprint sprint = (Sprint) query.getSingleResult();
            return Optional.of(sprint);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public boolean existsByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT COUNT(s) > 0 FROM Sprint s WHERE s.id = :id AND s.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }
    
    // Native query methods for read operations (performance optimization)
    @SuppressWarnings("unchecked")
    public List<Object[]> findSprintsByProjectIdNative(UUID projectId) {
        String sql = """
            SELECT s.id, s.name, s.story_points_per_day, s.start_date, s.end_date, 
                   s.specific_holidays, s.project_id, s.version, s.created_at, s.updated_at
            FROM sprints s 
            WHERE s.project_id = :projectId 
            ORDER BY s.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    public Optional<Object[]> findSprintByIdAndProjectIdNative(UUID id, UUID projectId) {
        String sql = """
            SELECT s.id, s.name, s.story_points_per_day, s.start_date, s.end_date, 
                   s.specific_holidays, s.project_id, s.version, s.created_at, s.updated_at
            FROM sprints s 
            WHERE s.id = :id AND s.project_id = :projectId
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        
        try {
            Object[] result = (Object[]) query.getSingleResult();
            return Optional.of(result);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    @SuppressWarnings("unchecked")
    public List<Object[]> findSprintListByProjectIdNative(UUID projectId) {
        String sql = """
            SELECT s.id, s.name
            FROM sprints s 
            WHERE s.project_id = :projectId 
            ORDER BY s.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    /**
     * Get sprint work days and story points per day
     */
    public Object[] getSprintWorkDaysNative(UUID sprintId) {
        String sql = """
            SELECT 
              (s.END_DATE - s.START_DATE + 1) - jsonb_array_length(s.SPECIFIC_HOLIDAYS) as work_days,
              s.STORY_POINTS_PER_DAY
            FROM SPRINTS s 
            WHERE s.ID = :sprintId
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("sprintId", sprintId);
        return (Object[]) query.getSingleResult();
    }
    
    /**
     * Get all sprints for assignees linked to the user
     * Returns: sprint_id, sprint_name, start_date, end_date, task_count, 
     *          project_id, project_name, project_thumbnail_url, project_description,
     *          departments (comma-separated)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findSprintsByUserAssigneesNative(UUID userId) {
        String sql = """
            WITH user_assignees_sprints AS (
                SELECT DISTINCT
                    s.id AS sprint_id,
                    s.name AS sprint_name,
                    s.start_date,
                    s.end_date,
                    p.id AS project_id,
                    p.name AS project_name,
                    p.thumbnail_url AS project_thumbnail_url,
                    p.description AS project_description
                FROM user_assignees ua
                INNER JOIN assignees a ON ua.assignee_id = a.id
                INNER JOIN tasks t ON a.id = t.assignee_id
                INNER JOIN sprints s ON t.sprint_id = s.id
                INNER JOIN projects p ON s.project_id = p.id
                WHERE ua.user_id = :userId
            ),
            sprint_task_counts AS (
                SELECT 
                    t.sprint_id,
                    COUNT(t.id) AS task_count
                FROM tasks t
                INNER JOIN assignees a ON t.assignee_id = a.id
                INNER JOIN user_assignees ua ON a.id = ua.assignee_id
                WHERE ua.user_id = :userId
                GROUP BY t.sprint_id
            ),
            sprint_departments AS (
                SELECT 
                    t.sprint_id,
                    STRING_AGG(DISTINCT d.name, ', ' ORDER BY d.name) AS departments
                FROM tasks t
                INNER JOIN assignees a ON t.assignee_id = a.id
                INNER JOIN user_assignees ua ON a.id = ua.assignee_id
                LEFT JOIN departments d ON t.department_id = d.id
                WHERE ua.user_id = :userId
                GROUP BY t.sprint_id
            )
            SELECT 
                uas.sprint_id,
                uas.sprint_name,
                uas.start_date,
                uas.end_date,
                COALESCE(stc.task_count, 0) AS task_count,
                uas.project_id,
                uas.project_name,
                uas.project_thumbnail_url,
                uas.project_description,
                COALESCE(sd.departments, '') AS departments
            FROM user_assignees_sprints uas
            LEFT JOIN sprint_task_counts stc ON uas.sprint_id = stc.sprint_id
            LEFT JOIN sprint_departments sd ON uas.sprint_id = sd.sprint_id
            ORDER BY uas.start_date DESC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("userId", userId);
        return query.getResultList();
    }
    
    /**
     * Get a specific sprint by ID for an assignee user
     * Returns: sprint_id, sprint_name, start_date, end_date, task_count, 
     *          project_id, project_name, project_thumbnail_url, project_description,
     *          departments (comma-separated)
     * Returns null if user doesn't have access to the sprint
     */
    public Optional<Object[]> findSprintByIdForAssigneeNative(UUID sprintId, UUID userId) {
        String sql = """
            WITH user_sprint_access AS (
                SELECT DISTINCT
                    s.id AS sprint_id,
                    s.name AS sprint_name,
                    s.start_date,
                    s.end_date,
                    p.id AS project_id,
                    p.name AS project_name,
                    p.thumbnail_url AS project_thumbnail_url,
                    p.description AS project_description
                FROM user_assignees ua
                INNER JOIN assignees a ON ua.assignee_id = a.id
                INNER JOIN tasks t ON a.id = t.assignee_id
                INNER JOIN sprints s ON t.sprint_id = s.id
                INNER JOIN projects p ON s.project_id = p.id
                WHERE ua.user_id = :userId AND s.id = :sprintId
            ),
            sprint_task_count AS (
                SELECT 
                    COUNT(t.id) AS task_count
                FROM tasks t
                INNER JOIN assignees a ON t.assignee_id = a.id
                INNER JOIN user_assignees ua ON a.id = ua.assignee_id
                WHERE ua.user_id = :userId AND t.sprint_id = :sprintId
            ),
            sprint_departments AS (
                SELECT 
                    STRING_AGG(DISTINCT d.name, ', ' ORDER BY d.name) AS departments
                FROM tasks t
                INNER JOIN assignees a ON t.assignee_id = a.id
                INNER JOIN user_assignees ua ON a.id = ua.assignee_id
                LEFT JOIN departments d ON t.department_id = d.id
                WHERE ua.user_id = :userId AND t.sprint_id = :sprintId
            )
            SELECT 
                usa.sprint_id,
                usa.sprint_name,
                usa.start_date,
                usa.end_date,
                COALESCE(stc.task_count, 0) AS task_count,
                usa.project_id,
                usa.project_name,
                usa.project_thumbnail_url,
                usa.project_description,
                COALESCE(sd.departments, '') AS departments
            FROM user_sprint_access usa
            CROSS JOIN sprint_task_count stc
            CROSS JOIN sprint_departments sd
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("sprintId", sprintId);
        query.setParameter("userId", userId);
        
        try {
            Object[] result = (Object[]) query.getSingleResult();
            return Optional.of(result);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Sprint> getUserSprint(UUID userId, UUID sprintId) {
        String sql = """
            SELECT S.*
            FROM USERS U
                     INNER JOIN USER_ASSIGNEES UA ON U.ID = UA.USER_ID
                     INNER JOIN TASKS T ON UA.ASSIGNEE_ID = T.ASSIGNEE_ID
                     INNER JOIN SPRINTS S ON T.SPRINT_ID = S.ID
            WHERE U.ID = :userId
              AND S.ID = :sprintId
            GROUP BY S.ID
        """;

        try {
            Query query = entityManager.createNativeQuery(sql, Sprint.class);
            query.setParameter("userId", userId);
            query.setParameter("sprintId", sprintId);

            return Optional.of((Sprint) query.getSingleResult());
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }
}
