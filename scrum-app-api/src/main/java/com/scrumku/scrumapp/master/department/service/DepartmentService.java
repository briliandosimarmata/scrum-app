package com.scrumku.scrumapp.master.department.service;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeListResponse;
import com.scrumku.scrumapp.master.assignee.dto.AssigneeResponse;
import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import com.scrumku.scrumapp.master.assignee.repository.AssigneeRepository;
import com.scrumku.scrumapp.master.department.dto.DepartmentListWithMembersResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentMemberRequest;
import com.scrumku.scrumapp.master.department.dto.DepartmentMemberResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentRequest;
import com.scrumku.scrumapp.master.department.dto.DepartmentResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentTask;
import com.scrumku.scrumapp.master.department.dto.DepartmentTasksResponse;
import com.scrumku.scrumapp.master.department.dto.DepartmentWithMembersResponse;
import com.scrumku.scrumapp.master.department.entity.Department;
import com.scrumku.scrumapp.master.department.entity.DepartmentMember;
import com.scrumku.scrumapp.master.department.repository.DepartmentCounterRepository;
import com.scrumku.scrumapp.master.department.repository.DepartmentMemberRepository;
import com.scrumku.scrumapp.master.department.repository.DepartmentRepository;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.master.project.repository.ProjectRepository;
import com.scrumku.scrumapp.sprint.repository.SprintRepository;
import com.scrumku.scrumapp.task.entity.Task;
import com.scrumku.scrumapp.task.repository.TaskRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    private final DepartmentMemberRepository departmentMemberRepository;
    private final DepartmentCounterRepository departmentCounterRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final AssigneeRepository assigneeRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public ApiResponse<DepartmentResponse> getDepartmentById(UUID departmentId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get department using native query for performance
            var result = departmentRepository.findDepartmentByIdAndProjectIdNative(departmentId, projectId);
            
            if (result.isEmpty()) {
                return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
            }
            
            DepartmentResponse response = mapToDepartmentResponse(result.get());
            return ApiResponse.success("Department retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve department", "DEPARTMENT_RETRIEVAL_ERROR", "Failed to retrieve department");
        }
    }
    
    public ApiResponse<Void> deleteDepartmentById(UUID departmentId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Check if department exists
            if (!departmentRepository.existsByIdAndProjectId(departmentId, projectId)) {
                return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
            }
            
            // Delete using JPA
            departmentRepository.deleteById(departmentId);
            
            return ApiResponse.success("Department deleted successfully", null);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete department", "DEPARTMENT_DELETION_ERROR", "Failed to delete department");
        }
    }
    
    public ApiResponse<DepartmentWithMembersResponse> getDepartmentWithMembersById(UUID departmentId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get department using native query for performance
            var departmentResult = departmentRepository.findDepartmentByIdAndProjectIdNative(departmentId, projectId);
            
            if (departmentResult.isEmpty()) {
                return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
            }
            
            // Get department members using native query for performance
            List<Object[]> memberResults = departmentMemberRepository.findDepartmentMembersByDepartmentIdNative(departmentId);
            
            // Map department data
            Object[] deptData = departmentResult.get();
            DepartmentWithMembersResponse department = DepartmentWithMembersResponse.builder()
                    .id((UUID) deptData[0])
                    .code((String) deptData[1])
                    .name((String) deptData[2])
                    .projectId((UUID) deptData[3])
                    .members(memberResults.stream()
                            .map(this::mapToDepartmentMemberResponse)
                            .collect(Collectors.toList()))
                    .memberCount(memberResults.size())
                    .createdAt(((java.sql.Timestamp) deptData[5]).toLocalDateTime())
                    .updatedAt(((java.sql.Timestamp) deptData[6]).toLocalDateTime())
                    .build();
            
            return ApiResponse.success("Department with members retrieved successfully", department);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve department with members", "DEPARTMENT_RETRIEVAL_ERROR", "Failed to retrieve department with members");
        }
    }
    
    public ApiResponse<DepartmentListWithMembersResponse> getAllDepartmentsWithMembers(UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get departments using native query for performance
            List<Object[]> departmentResults = departmentRepository.findDepartmentsByProjectIdNative(projectId);
            
            List<DepartmentWithMembersResponse> departments = new ArrayList<>();
            
            for (Object[] deptData : departmentResults) {
                UUID departmentId = (UUID) deptData[0];
                
                // Get members for this department
                List<Object[]> memberResults = departmentMemberRepository.findDepartmentMembersByDepartmentIdNative(departmentId);
                
                DepartmentWithMembersResponse department = DepartmentWithMembersResponse.builder()
                        .id((UUID) deptData[0])
                        .code((String) deptData[1])
                        .name((String) deptData[2])
                        .projectId((UUID) deptData[3])
                        .members(memberResults.stream()
                                .map(this::mapToDepartmentMemberResponse)
                                .collect(Collectors.toList()))
                        .memberCount(memberResults.size())
                        .createdAt(((java.sql.Timestamp) deptData[5]).toLocalDateTime())
                        .updatedAt(((java.sql.Timestamp) deptData[6]).toLocalDateTime())
                        .build();
                
                departments.add(department);
            }
            
            DepartmentListWithMembersResponse response = DepartmentListWithMembersResponse.builder()
                    .departments(departments)
                    .totalCount(departments.size())
                    .build();
            
            return ApiResponse.success("Departments with members retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve departments with members", "DEPARTMENT_RETRIEVAL_ERROR", "Failed to retrieve departments with members");
        }
    }
    
    public ApiResponse<DepartmentWithMembersResponse> createDepartment(DepartmentRequest request, UUID userId) {
        try {
            // Verify project exists and belongs to user
            Project project = projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Generate unique department code
            String code = generateDepartmentCode(request.getName(), project.getCode(), request.getProjectId());
            
            // Create department entity
            Department department = Department.builder()
                    .name(request.getName())
                    .code(code)
                    .project(project)
                    .build();
            
            // Save department
            Department savedDepartment = departmentRepository.save(department);
            
            // Process members
            processDepartmentMembers(savedDepartment, request.getMembers(), request.getProjectId());
            
            // Get department with members for response
            return getDepartmentWithMembersById(savedDepartment.getId(), request.getProjectId(), userId);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to create department", "DEPARTMENT_CREATION_ERROR", "Failed to create department");
        }
    }
    
    public ApiResponse<DepartmentWithMembersResponse> updateDepartment(DepartmentRequest request, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Check if department exists
            Department existingDepartment = departmentRepository.findByIdAndProjectId(request.getId(), request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            
            // Update department name
            existingDepartment.setName(request.getName());
            Department savedDepartment = departmentRepository.save(existingDepartment);
            
            // Process members (add, update, remove)
            processDepartmentMembers(savedDepartment, request.getMembers(), request.getProjectId());
            
            // Get department with members for response
            return getDepartmentWithMembersById(savedDepartment.getId(), request.getProjectId(), userId);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to update department", "DEPARTMENT_UPDATE_ERROR", "Failed to update department");
        }
    }
    
    private String generateDepartmentCode(String name, String projectCode, UUID projectId) {
        // Generate department code: {projectCode}-{nameInitials}-{counter}
        String nameInitials = generateNameInitials(name);
        String prefix = projectCode + "-" + nameInitials;
        
        // Get next counter value atomically
        Integer counter = departmentCounterRepository.incrementAndGetCounter(projectId, prefix);
        
        return prefix + "-" + counter;
    }
    
    private String generateNameInitials(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "DEPT";
        }
        
        String[] words = name.trim().split("\\s+");
        if (words.length == 1) {
            // Single word: take first 2 characters
            return words[0].substring(0, Math.min(2, words[0].length())).toUpperCase();
        } else {
            // Multiple words: take first character of each word
            StringBuilder initials = new StringBuilder();
            for (String word : words) {
                if (!word.isEmpty()) {
                    initials.append(word.charAt(0));
                }
            }
            return initials.toString().toUpperCase();
        }
    }
    
    private void processDepartmentMembers(Department department, List<DepartmentMemberRequest> memberRequests, UUID projectId) {
        if (memberRequests == null || memberRequests.isEmpty()) {
            return;
        }
        
        // Process each member request
        for (DepartmentMemberRequest memberRequest : memberRequests) {
            if (Boolean.TRUE.equals(memberRequest.getMarkForDelete())) {
                // Remove member by assigneeId
                departmentMemberRepository.findByDepartmentIdAndAssigneeId(department.getId(), memberRequest.getAssigneeId())
                        .ifPresent(departmentMemberRepository::delete);
            } else {
                // Add or update member by assigneeId
                processMemberRequest(department, memberRequest, projectId);
            }
        }
    }
    
    private void processMemberRequest(Department department, DepartmentMemberRequest memberRequest, UUID projectId) {
        // Verify assignee exists and belongs to project
        Assignee assignee = assigneeRepository.findByIdAndProjectId(memberRequest.getAssigneeId(), projectId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
        
        // Check if member already exists in this department
        Optional<DepartmentMember> existingMemberOpt = departmentMemberRepository.findByDepartmentIdAndAssigneeId(department.getId(), memberRequest.getAssigneeId());
        
        if (existingMemberOpt.isPresent()) {
            // Update existing member
            DepartmentMember existingMember = existingMemberOpt.get();
            
            // Check if priority is being set and handle constraint
            if (Boolean.TRUE.equals(memberRequest.getIsPriority()) && !Boolean.TRUE.equals(existingMember.getIsPriority())) {
                // Remove priority from other departments for this assignee
                removePriorityFromOtherDepartments(memberRequest.getAssigneeId(), department.getId());
            }
            
            existingMember.setIsPriority(memberRequest.getIsPriority());
            departmentMemberRepository.save(existingMember);
        } else {
            // Add new member
            // Check if priority is being set and handle constraint
            if (Boolean.TRUE.equals(memberRequest.getIsPriority())) {
                // Remove priority from other departments for this assignee
                removePriorityFromOtherDepartments(memberRequest.getAssigneeId(), department.getId());
            }
            
            DepartmentMember newMember = DepartmentMember.builder()
                    .department(department)
                    .assignee(assignee)
                    .isPriority(memberRequest.getIsPriority())
                    .build();
            
            departmentMemberRepository.save(newMember);
        }
    }
    
    private void removePriorityFromOtherDepartments(UUID assigneeId, UUID currentDepartmentId) {
        // Use native query to directly update priority flag for all other departments
        String sql = """
            UPDATE department_members 
            SET is_priority = false, updated_at = CURRENT_TIMESTAMP
            WHERE assignee_id = :assigneeId 
            AND department_id != :currentDepartmentId 
            AND is_priority = true
            """;
        
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("assigneeId", assigneeId);
        query.setParameter("currentDepartmentId", currentDepartmentId);
        
        int updatedRows = query.executeUpdate();
        log.debug("Removed priority from {} other departments for assignee {}", updatedRows, assigneeId);
    }
    
    private DepartmentResponse mapToDepartmentResponse(Object[] result) {
        return DepartmentResponse.builder()
                .id((UUID) result[0])
                .code((String) result[1])
                .name((String) result[2])
                .projectId((UUID) result[3])
                .createdAt(((java.sql.Timestamp) result[5]).toLocalDateTime())
                .updatedAt(((java.sql.Timestamp) result[6]).toLocalDateTime())
                .build();
    }
    
    public ApiResponse<AssigneeListResponse> getAssigneesByDepartment(UUID departmentId, UUID projectId, UUID userId) {
        try {
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Verify department exists and belongs to project
            if (!departmentRepository.existsByIdAndProjectId(departmentId, projectId)) {
                return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
            }
            
            // Get assignees by department using native query for performance
            List<Object[]> assigneeResults = departmentMemberRepository.findAssigneesByDepartmentIdNative(departmentId);
            
            List<AssigneeResponse> assignees = assigneeResults.stream()
                    .map(this::mapToAssigneeResponse)
                    .collect(Collectors.toList());
            
            AssigneeListResponse response = AssigneeListResponse.builder()
                    .assignees(assignees)
                    .totalCount(assignees.size())
                    .build();
            
            return ApiResponse.success("Assignees retrieved successfully", response);
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to retrieve assignees", "ASSIGNEE_RETRIEVAL_ERROR", "Failed to retrieve assignees");
        }
    }
    
    private DepartmentMemberResponse mapToDepartmentMemberResponse(Object[] result) {
        return DepartmentMemberResponse.builder()
                .assigneeId((UUID) result[2])
                .isPriority((Boolean) result[3])
                .assigneeCode((String) result[7]) // assignee_code from JOIN
                .assigneeName((String) result[8]) // assignee_name from JOIN
                .createdAt(((java.sql.Timestamp) result[5]).toLocalDateTime())
                .updatedAt(((java.sql.Timestamp) result[6]).toLocalDateTime())
                .build();
    }
    
    private AssigneeResponse mapToAssigneeResponse(Object[] result) {
        return AssigneeResponse.builder()
                .id((UUID) result[0])
                .code((String) result[1])
                .name((String) result[2])
                .projectId((UUID) result[3])
                .isPriority((Boolean) result[4]) // is_priority from department_members
                .createdAt(((java.sql.Timestamp) result[5]).toLocalDateTime())
                .updatedAt(((java.sql.Timestamp) result[6]).toLocalDateTime())
                .build();
    }
    
    /**
     * Get department tasks with summary data
     */
    public ApiResponse<DepartmentTasksResponse> getDepartmentTasks(UUID projectId, UUID departmentId, UUID sprintId, UUID userId) {
        try {
            log.info("Getting department tasks for project: {}, department: {}, sprint: {}", projectId, departmentId, sprintId);
            
            // Verify project exists and belongs to user
            projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            
            // Get department info
            var departmentResult = departmentRepository.findDepartmentByIdAndProjectIdNative(departmentId, projectId);
            if (departmentResult.isEmpty()) {
                return ApiResponse.error("Department not found", "DEPARTMENT_NOT_FOUND", "Department not found");
            }
            
            Object[] deptData = departmentResult.get();
            String departmentName = (String) deptData[2]; // name is at index 2
            
            // Get sprint work days and story points per day
            Object[] sprintData = sprintRepository.getSprintWorkDaysNative(sprintId);
            Long workDays = ((Number) sprintData[0]).longValue();
            Integer storyPointsPerDay = ((Number) sprintData[1]).intValue();
            
            // Get department member count
            Long memberCount = departmentRepository.getDepartmentMemberCountNative(departmentId);
            
            // Get total story points for department tasks
            Long departmentStoryPoints = taskRepository.getDepartmentStoryPointsNative(departmentId, sprintId);
            
            // Get total story points for all department member tasks
            Long memberStoryPoints = taskRepository.getDepartmentMemberStoryPointsNative(departmentId, sprintId);
            
            // Calculate total team capacity left
            Long totalCapacity = workDays * storyPointsPerDay * memberCount;
            Long totalTeamCapacityLeft = totalCapacity - memberStoryPoints;
            
            // Get department tasks
            List<Object[]> taskResults = taskRepository.getDepartmentTasksNative(departmentId, sprintId);
            List<DepartmentTask> tasks = taskResults.stream()
                    .map(this::mapToDepartmentTask)
                    .collect(Collectors.toList());
            
            // Build response
            DepartmentTasksResponse response = DepartmentTasksResponse.builder()
                    .departmentId(departmentId)
                    .departmentName(departmentName)
                    .totalStoryPoints(departmentStoryPoints.intValue())
                    .totalTeamCapacityLeft(totalTeamCapacityLeft.intValue())
                    .tasks(tasks)
                    .build();
            
            return ApiResponse.success("Department tasks retrieved successfully", response);
            
        } catch (Exception e) {
            log.error("Error retrieving department tasks for project: {}, department: {}, sprint: {}", 
                    projectId, departmentId, sprintId, e);
            return ApiResponse.error("Failed to retrieve department tasks", "DEPARTMENT_TASKS_ERROR", e.getMessage());
        }
    }
    
    /**
     * Map task result to DepartmentTask
     */
    private DepartmentTask mapToDepartmentTask(Object[] result) {
        return DepartmentTask.builder()
                .taskId((UUID) result[0])
                .taskCode((String) result[1])
                .description((String) result[2])
                .assigneeName((String) result[3])
                .priority(Task.TaskPriority.valueOf((String) result[4]))
                .storyPoints(((Number) result[5]).intValue())
                .daysSpent(BigDecimal.valueOf(((Number) result[6]).doubleValue()))
                .build();
    }
}
