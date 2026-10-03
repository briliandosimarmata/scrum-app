package com.scrumku.scrumapp.auth.repository;

import com.scrumku.scrumapp.auth.entity.UserAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAssigneeRepository extends JpaRepository<UserAssignee, UUID> {
    
    /**
     * Check if a user is already linked to a specific assignee
     */
    boolean existsByUserIdAndAssigneeId(UUID userId, UUID assigneeId);
    
    /**
     * Check if an assignee is already linked to any user
     */
    boolean existsByAssigneeId(UUID assigneeId);
    
    /**
     * Check if a user has any assignee roles
     */
    boolean existsByUserId(UUID userId);
    
    /**
     * Find all assignees linked to a specific user
     */
    List<UserAssignee> findByUserId(UUID userId);
    
    /**
     * Find the user linked to a specific assignee
     */
    Optional<UserAssignee> findByAssigneeId(UUID assigneeId);
    
    /**
     * Find all user-assignee links for a specific user
     */
    @Query(value = """
        SELECT ua.id, ua.user_id, ua.assignee_id, ua.created_at, ua.updated_at,
               u.email, u.first_name, u.last_name,
               a.code, a.name, a.project_id
        FROM user_assignees ua
        JOIN users u ON ua.user_id = u.id
        JOIN assignees a ON ua.assignee_id = a.id
        WHERE ua.user_id = :userId
        ORDER BY ua.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findUserAssigneesByUserIdNative(@Param("userId") UUID userId);
    
    /**
     * Find user-assignee link by assignee ID with user and assignee details
     */
    @Query(value = """
        SELECT ua.id, ua.user_id, ua.assignee_id, ua.created_at, ua.updated_at,
               u.email, u.first_name, u.last_name,
               a.code, a.name, a.project_id
        FROM user_assignees ua
        JOIN users u ON ua.user_id = u.id
        JOIN assignees a ON ua.assignee_id = a.id
        WHERE ua.assignee_id = :assigneeId
        """, nativeQuery = true)
    Optional<Object[]> findUserAssigneeByAssigneeIdNative(@Param("assigneeId") UUID assigneeId);

    @Query(value = """
            SELECT UA.ID, UA.ASSIGNEE_ID
            FROM USERS U
                     INNER JOIN USER_ASSIGNEES UA ON U.ID = UA.USER_ID
                     INNER JOIN TASKS T ON UA.ASSIGNEE_ID = T.ASSIGNEE_ID
                     INNER JOIN SPRINTS S ON T.SPRINT_ID = S.ID
            WHERE U.ID = :userId
              AND S.ID = :sprintId
            GROUP BY UA.ID
            """, nativeQuery = true)
    Optional<List<Object[]>> getUserAssigneeBySprint(@Param("userId") UUID userId, @Param("sprintId") UUID sprintId);
}
