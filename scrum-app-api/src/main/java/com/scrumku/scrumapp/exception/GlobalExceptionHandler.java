package com.scrumku.scrumapp.exception;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.common.dto.ErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        List<ErrorDetail.ValidationError> validationErrors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.add(ErrorDetail.ValidationError.builder()
                    .code("FIELD_VALIDATION_ERROR")
                    .message(errorMessage)
                    .field(fieldName)
                    .build());
        });
        
        ErrorDetail errorDetail = ErrorDetail.builder()
                .code("VALIDATION_ERROR")
                .message("2 out of " + validationErrors.size() + " fields failed validation.")
                .errors(validationErrors)
                .build();
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("validation error", errorDetail));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid credentials", "AUTHENTICATION_ERROR", "Invalid credentials"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied", "AUTHORIZATION_ERROR", "Access denied"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorDetail>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred", "INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
