package com.scrumku.scrumapp.task.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCounterId implements Serializable {
    
    private UUID projectId;
    private String projectCode;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskCounterId that = (TaskCounterId) o;
        return projectId.equals(that.projectId) && projectCode.equals(that.projectCode);
    }
    
    @Override
    public int hashCode() {
        return projectId.hashCode() + projectCode.hashCode();
    }
}

