package com.scrumku.scrumapp.master.assignee.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeCounterId implements Serializable {
    
    private UUID projectId;
    private String prefix;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        AssigneeCounterId that = (AssigneeCounterId) o;
        
        if (projectId != null ? !projectId.equals(that.projectId) : that.projectId != null) return false;
        return prefix != null ? prefix.equals(that.prefix) : that.prefix == null;
    }
    
    @Override
    public int hashCode() {
        int result = projectId != null ? projectId.hashCode() : 0;
        result = 31 * result + (prefix != null ? prefix.hashCode() : 0);
        return result;
    }
}
