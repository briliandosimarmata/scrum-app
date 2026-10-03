package com.scrumku.scrumapp.master.department.repository;

import com.scrumku.scrumapp.master.department.entity.DepartmentMember;
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
public class DepartmentMemberRepository extends SimpleJpaRepository<DepartmentMember, UUID> {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public DepartmentMemberRepository(EntityManager entityManager) {
        super(DepartmentMember.class, entityManager);
    }
    
    // JPA methods for CUD operations
    @SuppressWarnings("unchecked")
    public List<DepartmentMember> findByDepartmentIdOrderByCreatedAtAsc(UUID departmentId) {
        String jpql = "SELECT dm FROM DepartmentMember dm WHERE dm.department.id = :departmentId ORDER BY dm.createdAt ASC";
        Query query = entityManager.createQuery(jpql, DepartmentMember.class);
        query.setParameter("departmentId", departmentId);
        return query.getResultList();
    }
    
    @SuppressWarnings("unchecked")
    public List<DepartmentMember> findByAssigneeIdOrderByCreatedAtAsc(UUID assigneeId) {
        String jpql = "SELECT dm FROM DepartmentMember dm WHERE dm.assignee.id = :assigneeId ORDER BY dm.createdAt ASC";
        Query query = entityManager.createQuery(jpql, DepartmentMember.class);
        query.setParameter("assigneeId", assigneeId);
        return query.getResultList();
    }
    
    public boolean existsByDepartmentIdAndAssigneeId(UUID departmentId, UUID assigneeId) {
        String jpql = "SELECT COUNT(dm) > 0 FROM DepartmentMember dm WHERE dm.department.id = :departmentId AND dm.assignee.id = :assigneeId";
        Query query = entityManager.createQuery(jpql, Boolean.class);
        query.setParameter("departmentId", departmentId);
        query.setParameter("assigneeId", assigneeId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }
    
    public Optional<DepartmentMember> findByDepartmentIdAndAssigneeId(UUID departmentId, UUID assigneeId) {
        String jpql = "SELECT dm FROM DepartmentMember dm WHERE dm.department.id = :departmentId AND dm.assignee.id = :assigneeId";
        Query query = entityManager.createQuery(jpql, DepartmentMember.class);
        query.setParameter("departmentId", departmentId);
        query.setParameter("assigneeId", assigneeId);
        
        try {
            DepartmentMember member = (DepartmentMember) query.getSingleResult();
            return Optional.of(member);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    // Native query methods for read operations (performance optimization)
    @SuppressWarnings("unchecked")
    public List<Object[]> findDepartmentMembersByDepartmentIdNative(UUID departmentId) {
        String sql = """
            SELECT dm.id, dm.department_id, dm.assignee_id, dm.is_priority, dm.version, dm.created_at, dm.updated_at,
                   a.code as assignee_code, a.name as assignee_name
            FROM department_members dm
            JOIN assignees a ON dm.assignee_id = a.id
            WHERE dm.department_id = :departmentId 
            ORDER BY dm.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        return query.getResultList();
    }
    
    @SuppressWarnings("unchecked")
    public List<Object[]> findDepartmentMembersByAssigneeIdNative(UUID assigneeId) {
        String sql = """
            SELECT dm.id, dm.department_id, dm.assignee_id, dm.is_priority, dm.version, dm.created_at, dm.updated_at,
                   d.code as department_code, d.name as department_name
            FROM department_members dm
            JOIN departments d ON dm.department_id = d.id
            WHERE dm.assignee_id = :assigneeId 
            ORDER BY dm.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("assigneeId", assigneeId);
        return query.getResultList();
    }
    
    public boolean existsByDepartmentIdAndAssigneeIdNative(UUID departmentId, UUID assigneeId) {
        String sql = """
            SELECT COUNT(*) > 0
            FROM department_members dm
            WHERE dm.department_id = :departmentId AND dm.assignee_id = :assigneeId
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        query.setParameter("assigneeId", assigneeId);
        return Boolean.TRUE.equals(query.getSingleResult());
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> findAssigneesByDepartmentIdNative(UUID departmentId) {
        String sql = """
            SELECT a.id, a.code, a.name, a.project_id, dm.is_priority, a.created_at, a.updated_at
            FROM assignees a
            JOIN department_members dm ON a.id = dm.assignee_id
            WHERE dm.department_id = :departmentId
            ORDER BY dm.created_at ASC
            """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("departmentId", departmentId);
        return query.getResultList();
    }
}

