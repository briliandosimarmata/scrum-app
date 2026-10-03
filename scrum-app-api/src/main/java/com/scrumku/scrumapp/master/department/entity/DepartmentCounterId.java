package com.scrumku.scrumapp.master.department.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentCounterId implements Serializable {
    
    private UUID projectId;
    private String prefix;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DepartmentCounterId that = (DepartmentCounterId) o;
        return projectId != null ? projectId.equals(that.projectId) : that.projectId == null &&
                prefix != null ? prefix.equals(that.prefix) : that.prefix == null;
    }
    
    @Override
    public int hashCode() {
        int result = projectId != null ? projectId.hashCode() : 0;
        result = 31 * result + (prefix != null ? prefix.hashCode() : 0);
        return result;
    }
}

