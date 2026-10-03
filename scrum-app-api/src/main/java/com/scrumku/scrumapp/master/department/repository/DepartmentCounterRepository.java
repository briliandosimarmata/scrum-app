package com.scrumku.scrumapp.master.department.repository;

import com.scrumku.scrumapp.master.department.entity.DepartmentCounter;
import com.scrumku.scrumapp.master.department.entity.DepartmentCounterId;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Slf4j
@Repository
public class DepartmentCounterRepository extends SimpleJpaRepository<DepartmentCounter, DepartmentCounterId> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public DepartmentCounterRepository(EntityManager entityManager) {
        super(DepartmentCounter.class, entityManager);
    }
    
    /**
     * Atomically increment and get the counter for a given project and prefix.
     * Uses PostgreSQL's ON CONFLICT (UPSERT) for thread-safe counter increment.
     */
    public Integer incrementAndGetCounter(UUID projectId, String prefix) {
        String sql = """
            INSERT INTO department_counters (project_id, prefix, counter, created_at, updated_at)
            VALUES (:projectId, :prefix, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (project_id, prefix)
            DO UPDATE SET 
                counter = department_counters.counter + 1,
                updated_at = CURRENT_TIMESTAMP
            RETURNING counter
            """;
        
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        query.setParameter("prefix", prefix);
        
        return (Integer) query.getSingleResult();
    }
}

