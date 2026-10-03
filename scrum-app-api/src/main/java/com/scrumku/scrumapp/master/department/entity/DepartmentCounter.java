package com.scrumku.scrumapp.master.department.entity;

import com.scrumku.scrumapp.master.project.entity.Project;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "department_counters")
@IdClass(DepartmentCounterId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DepartmentCounter {
    
    @Id
    @Column(name = "project_id", nullable = false)
    private UUID projectId;
    
    @Id
    @Column(name = "prefix", nullable = false, length = 10)
    private String prefix;
    
    @Column(name = "counter", nullable = false)
    @Builder.Default
    private Integer counter = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private Project project;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
