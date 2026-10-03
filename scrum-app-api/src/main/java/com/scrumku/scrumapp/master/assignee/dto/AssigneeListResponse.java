package com.scrumku.scrumapp.master.assignee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeListResponse {
    private List<AssigneeResponse> assignees;
    private int totalCount;
}
