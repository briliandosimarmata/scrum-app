package com.scrumku.scrumapp.task.repository;

import com.scrumku.scrumapp.task.entity.TaskCounter;
import com.scrumku.scrumapp.task.entity.TaskCounterId;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Slf4j
@Repository
public class TaskCounterRepository extends SimpleJpaRepository<TaskCounter, TaskCounterId> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public TaskCounterRepository(EntityManager entityManager) {
        super(TaskCounter.class, entityManager);
    }
    
    /**
     * Atomically increment counter and return the new value
     * This uses a native query to ensure atomicity at the database level
     */
    public Integer incrementAndGetCounter(UUID projectId, String projectCode) {
        try {
            String sql = """
                WITH upsert AS (
                    INSERT INTO task_counters (project_id, project_code, counter) 
                    VALUES (:projectId, :projectCode, 1) 
                    ON CONFLICT (project_id, project_code) 
                    DO UPDATE SET counter = task_counters.counter + 1 
                    RETURNING counter
                )
                SELECT counter FROM upsert
                """;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("projectId", projectId);
            query.setParameter("projectCode", projectCode);
            
            Object result = query.getSingleResult();
            Integer counter = ((Number) result).intValue();
            
            log.debug("Incremented task counter for projectId={}, projectCode={}, new value={}", 
                     projectId, projectCode, counter);
            
            return counter;
            
        } catch (Exception e) {
            log.error("Failed to increment task counter for projectId={}, projectCode={}", 
                     projectId, projectCode, e);
            throw new RuntimeException("Failed to increment task counter", e);
        }
    }

}

