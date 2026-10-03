package com.scrumku.scrumapp.common.dto;

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
public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;
    private ErrorDetail error;
    
    // Static factory methods for success responses
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation completed successfully")
                .data(data)
                .error(null)
                .build();
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .error(null)
                .build();
    }
    
    // Static factory methods for error responses
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .error(ErrorDetail.builder()
                        .code("ERROR")
                        .message(message)
                        .build())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, ErrorDetail error) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .error(error)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, String errorCode, String errorMessage) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .error(ErrorDetail.builder()
                        .code(errorCode)
                        .message(errorMessage)
                        .build())
                .build();
    }
}