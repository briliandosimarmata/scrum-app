package com.scrumku.scrumapp.master.assignee.repository;

import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssigneeRepository extends JpaRepository<Assignee, UUID> {
    
    // JPA methods for CUD operations
    List<Assignee> findByProjectIdOrderByCreatedAtAsc(UUID projectId);
    
    Optional<Assignee> findByIdAndProjectId(UUID id, UUID projectId);
    
    boolean existsByCodeAndProjectId(String code, UUID projectId);
    
    boolean existsByIdAndProjectId(UUID id, UUID projectId);
    
    Optional<Assignee> findByCodeAndProjectId(String code, UUID projectId);
    
    // Native query methods for read operations (performance optimization)
    @Query(value = """
        SELECT a.id, a.code, a.name, a.project_id, a.version, a.created_at, a.updated_at
        FROM assignees a 
        WHERE a.project_id = :projectId 
        ORDER BY a.created_at ASC
        """, nativeQuery = true)
    List<Object[]> findAssigneesByProjectIdNative(@Param("projectId") UUID projectId);
    
    @Query(value = """
        SELECT a.id, a.code, a.name, a.project_id, a.version, a.created_at, a.updated_at
        FROM assignees a 
        WHERE a.id = :id AND a.project_id = :projectId
        """, nativeQuery = true)
    Optional<Object[]> findAssigneeByIdAndProjectIdNative(@Param("id") UUID id, @Param("projectId") UUID projectId);
    
    // Dropdown-specific native query
    @Query(value = """
        SELECT a.id, a.name, dm.department_id
        FROM assignees a 
        LEFT JOIN department_members dm ON a.id = dm.assignee_id
        WHERE a.project_id = :projectId 
        ORDER BY a.created_at ASC
        """, nativeQuery = true)
    List<Object[]> findAssigneesForDropdownNative(@Param("projectId") UUID projectId);
    
    @Query(value = """
        SELECT a.id, a.name
        FROM assignees a 
        WHERE a.id = :assigneeId
        """, nativeQuery = true)
    Optional<Object[]> findAssigneeByIdNative(@Param("assigneeId") UUID assigneeId);


    @Query(value = """
            SELECT A.ID, A.NAME
            FROM ASSIGNEES A
                     INNER JOIN TASKS T ON A.ID = T.ASSIGNEE_ID
                     INNER JOIN SPRINTS S ON T.SPRINT_ID = S.ID
            WHERE SPRINT_ID = :sprintId
            GROUP BY A.ID
            """, nativeQuery = true)
    Optional<List<Object[]>> findAssigneeInSprint(@Param("sprintId") UUID sprintId);

}
