package com.scrumku.scrumapp.master.project.repository;

import com.scrumku.scrumapp.master.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    // JPA methods for CUD operations
    List<Project> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Optional<Project> findByIdAndUserId(UUID id, UUID userId);
    
    Optional<Project> findByCodeAndUserId(String code, UUID userId);
    
    boolean existsByCodeAndUserId(String code, UUID userId);
    
    boolean existsByIdAndUserId(UUID id, UUID userId);
    
    // Native query methods for read operations (performance optimization)
    @Query(value = """
        SELECT p.id, p.name, p.code, p.description, p.thumbnail_url, p.user_id, 
               p.version, p.created_at, p.updated_at
        FROM projects p 
        WHERE p.user_id = :userId 
        ORDER BY p.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findProjectsByUserIdNative(@Param("userId") UUID userId);
    
    @Query(value = """
        SELECT p.id, p.name, p.code, p.description, p.thumbnail_url, p.user_id, 
               p.version, p.created_at, p.updated_at
        FROM projects p 
        WHERE p.id = :id AND p.user_id = :userId
        """, nativeQuery = true)
    Optional<Object[]> findProjectByIdAndUserIdNative(@Param("id") UUID id, @Param("userId") UUID userId);
    
    @Query(value = """
        SELECT COUNT(*) > 0
        FROM projects p 
        WHERE p.code = :code AND p.user_id = :userId
        """, nativeQuery = true)
    boolean existsByCodeAndUserIdNative(@Param("code") String code, @Param("userId") UUID userId);
    
    @Query(value = """
        SELECT 
            COALESCE((SELECT COUNT(*) FROM tasks WHERE project_id = :projectId), 0) as total_tasks,
            COALESCE((SELECT COUNT(*) FROM sprints WHERE project_id = :projectId), 0) as total_sprints,
            COALESCE((SELECT COUNT(*) FROM departments WHERE project_id = :projectId), 0) as total_departments,
            COALESCE((SELECT COUNT(*) FROM assignees WHERE project_id = :projectId), 0) as total_assignees
        FROM projects p
        WHERE p.id = :projectId
        """, nativeQuery = true)
    Object[] getProjectSummaryNative(@Param("projectId") UUID projectId);
    
    @Query(value = """
        SELECT p.id
        FROM projects p
        WHERE p.id = :projectId
        """, nativeQuery = true)
    Object[] testProjectExists(@Param("projectId") UUID projectId);
    
    /**
     * Find project by encrypted project key
     */
    Optional<Project> findByProjectKey(String projectKey);

    /**
     * Find project by deterministic digest of project key
     */
    @Query(value = "SELECT * FROM projects p WHERE p.project_key_digest = :digest LIMIT 1", nativeQuery = true)
    Optional<Project> findByProjectKeyDigestNative(@Param("digest") String digest);
}
