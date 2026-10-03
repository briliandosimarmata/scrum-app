package com.scrumku.scrumapp.common.dropdown.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DropdownOptionDto<T> {
    private String id;
    private String name;
    private String displayName; // Optional
    private String badgeClass;  // Optional
    private T metadata;         // Optional
}
