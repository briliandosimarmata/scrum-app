package com.scrumku.scrumapp.common.dropdown.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeMetadata {
    private String departmentId;
}
