package com.scrumku.scrumapp.master.department.repository;

import com.scrumku.scrumapp.master.department.entity.Department;
import jakarta.persistence.EntityManager;
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
public class DepartmentRepository extends SimpleJpaRepository<Department, UUID> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public DepartmentRepository(EntityManager entityManager) {
        super(Department.class, entityManager);
    }
    
    // JPA methods for CUD operations
    @SuppressWarnings("unchecked")
    public List<Department> findByProjectIdOrderByCreatedAtAsc(UUID projectId) {
        String jpql = "SELECT d FROM Department d WHERE d.project.id = :projectId ORDER BY d.createdAt ASC";
        Query query = entityManager.createQuery(jpql, Department.class);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    public Optional<Department> findByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT d FROM Department d WHERE d.id = :id AND d.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Department.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        
        try {
            Department result = (Department) query.getSingleResult();
            return Optional.of(result);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    public boolean existsByCodeAndProjectId(String code, UUID projectId) {
        String jpql = "SELECT COUNT(d) > 0 FROM Department d WHERE d.code = :code AND d.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("code", code);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }
    
    public boolean existsByIdAndProjectId(UUID id, UUID projectId) {
        String jpql = "SELECT COUNT(d) > 0 FROM Department d WHERE d.id = :id AND d.project.id = :projectId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("id", id);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }
    
    // Native query methods for read operations (performance optimization)
    @SuppressWarnings("unchecked")
    public List<Object[]> findDepartmentsByProjectIdNative(UUID projectId) {
        String sql = """
            SELECT d.id, d.code, d.name, d.project_id, d.version, d.created_at, d.updated_at
            FROM departments d 
            WHERE d.project_id = :projectId 
            ORDER BY d.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    public Optional<Object[]> findDepartmentByIdAndProjectIdNative(UUID id, UUID projectId) {
        String sql = """
            SELECT d.id, d.code, d.name, d.project_id, d.version, d.created_at, d.updated_at
            FROM departments d 
            WHERE d.id = :id AND d.project_id = :projectId
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
    
    public boolean existsByCodeAndProjectIdNative(String code, UUID projectId) {
        String sql = """
            SELECT COUNT(*) > 0
            FROM departments d 
            WHERE d.code = :code AND d.project_id = :projectId
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("code", code);
        query.setParameter("projectId", projectId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }
    
    // Dropdown-specific native query
    @SuppressWarnings("unchecked")
    public List<Object[]> findDepartmentsForDropdownNative(UUID projectId) {
        String sql = """
            SELECT d.id, d.name
            FROM departments d 
            WHERE d.project_id = :projectId 
            ORDER BY d.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("projectId", projectId);
        return query.getResultList();
    }
    
    /**
     * Get department member count
     */
    public Long getDepartmentMemberCountNative(UUID departmentId) {
        String sql = """
            SELECT COUNT(DISTINCT dm.ASSIGNEE_ID) as member_count
            FROM DEPARTMENT_MEMBERS dm 
            WHERE dm.DEPARTMENT_ID = :departmentId
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        return ((Number) query.getSingleResult()).longValue();
    }
}