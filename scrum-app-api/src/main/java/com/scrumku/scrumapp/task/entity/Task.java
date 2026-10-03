package com.scrumku.scrumapp.task.entity;

import com.scrumku.scrumapp.master.assignee.entity.Assignee;
import com.scrumku.scrumapp.master.department.entity.Department;
import com.scrumku.scrumapp.master.project.entity.Project;
import com.scrumku.scrumapp.sprint.entity.Sprint;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "story_points", nullable = false)
    private Integer storyPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaskPriority priority;

    @Column(name = "task_order", nullable = false)
    private Integer taskOrder;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Assignee assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dependency_task_id")
    private Task dependencyTask;

    // Audit fields
    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Enums
    public enum TaskStatus {
        TODO,
        IN_PROGRESS,
        DONE,
        CLOSED
    }

    public enum TaskPriority {
        HIGH,
        MEDIUM,
        LOW
    }

    // Validation methods for circular dependency detection
    /**
     * Validates that setting this task as a dependency of another task won't create a circular dependency.
     * This method should be called before setting dependencyTask.
     * 
     * @param potentialDependentTaskId The ID of the task that would depend on this task
     * @return true if the dependency is valid (no circular dependency), false otherwise
     */
    public boolean isValidDependency(UUID potentialDependentTaskId) {
        if (potentialDependentTaskId == null || this.id == null) {
            return true; // No dependency or no ID means no circular dependency
        }
        
        if (this.id.equals(potentialDependentTaskId)) {
            return false; // A task cannot depend on itself
        }
        
        // Check if the potential dependent task is already in our dependency chain
        return !isInDependencyChain(potentialDependentTaskId);
    }
    
    /**
     * Checks if a given task ID exists in the dependency chain of this task.
     * This is a recursive method that traverses up the dependency chain.
     * 
     * @param taskId The task ID to search for in the dependency chain
     * @return true if the task ID is found in the dependency chain, false otherwise
     */
    private boolean isInDependencyChain(UUID taskId) {
        if (taskId == null || this.dependencyTask == null) {
            return false;
        }
        
        if (this.dependencyTask.getId().equals(taskId)) {
            return true;
        }
        
        // Recursively check the parent dependency
        return this.dependencyTask.isInDependencyChain(taskId);
    }
    
    /**
     * Gets the depth of the dependency chain for this task.
     * This helps identify potential performance issues with very deep dependency chains.
     * 
     * @return The depth of the dependency chain (0 if no dependencies)
     */
    public int getDependencyDepth() {
        if (this.dependencyTask == null) {
            return 0;
        }
        
        return 1 + this.dependencyTask.getDependencyDepth();
    }
    
    /**
     * Gets all task IDs in the dependency chain of this task.
     * This is useful for validation and debugging purposes.
     * 
     * @return A list of task IDs in the dependency chain (excluding this task's ID)
     */
    public List<UUID> getDependencyChainIds() {
        List<UUID> chainIds = new ArrayList<>();
        
        if (this.dependencyTask != null) {
            chainIds.add(this.dependencyTask.getId());
            chainIds.addAll(this.dependencyTask.getDependencyChainIds());
        }
        
        return chainIds;
    }
}
