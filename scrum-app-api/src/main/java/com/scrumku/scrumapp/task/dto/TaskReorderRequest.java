package com.scrumku.scrumapp.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskReorderRequest {

    @NotNull(message = "Task orders are required")
    private List<TaskOrderItem> taskOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskOrderItem {
        @NotNull(message = "Task ID is required")
        private String taskId; // Changed to String to match frontend
        
        @NotNull(message = "Task order is required")
        private Integer taskOrder;
    }
}
