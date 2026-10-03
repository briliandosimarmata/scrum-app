package com.scrumku.scrumapp.master.department.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentListWithMembersResponse {
    private List<DepartmentWithMembersResponse> departments;
    private int totalCount;
}

