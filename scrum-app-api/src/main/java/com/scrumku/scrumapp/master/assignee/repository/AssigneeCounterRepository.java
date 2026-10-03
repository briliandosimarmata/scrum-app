package com.scrumku.scrumapp.master.assignee.repository;

import com.scrumku.scrumapp.master.assignee.entity.AssigneeCounter;
import com.scrumku.scrumapp.master.assignee.entity.AssigneeCounterId;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Slf4j
@Repository
public class AssigneeCounterRepository extends SimpleJpaRepository<AssigneeCounter, AssigneeCounterId> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public AssigneeCounterRepository(EntityManager entityManager) {
        super(AssigneeCounter.class, entityManager);
    }
    
    /**
     * Atomically increment counter and return the new value
     * This uses a native query to ensure atomicity at the database level
     */
    public Integer incrementAndGetCounter(UUID projectId, String prefix) {
        try {
            String sql = """
                WITH upsert AS (
                    INSERT INTO assignee_counters (project_id, prefix, counter) 
                    VALUES (:projectId, :prefix, 1) 
                    ON CONFLICT (project_id, prefix) 
                    DO UPDATE SET counter = assignee_counters.counter + 1 
                    RETURNING counter
                )
                SELECT counter FROM upsert
                """;
            
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("projectId", projectId);
            query.setParameter("prefix", prefix);
            
            Object result = query.getSingleResult();
            Integer counter = ((Number) result).intValue();
            
            log.debug("Incremented counter for projectId={}, prefix={}, new value={}", 
                     projectId, prefix, counter);
            
            return counter;
            
        } catch (Exception e) {
            log.error("Failed to increment counter for projectId={}, prefix={}", 
                     projectId, prefix, e);
            throw new RuntimeException("Failed to increment assignee counter", e);
        }
    }

}
