package com.scrumku.scrumapp.task.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "task_counters")
@IdClass(TaskCounterId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCounter {
    
    @Id
    @Column(name = "project_id", nullable = false)
    private UUID projectId;
    
    @Id
    @Column(name = "project_code", nullable = false, length = 4)
    private String projectCode;
    
    @Column(name = "counter", nullable = false)
    private Integer counter;
}

