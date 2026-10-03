package com.scrumku.scrumapp.auth.controller;

import com.scrumku.scrumapp.auth.dto.AssigneeRegistrationRequest;
import com.scrumku.scrumapp.auth.dto.AssigneeRegistrationResponse;
import com.scrumku.scrumapp.auth.service.AssigneeRegistrationService;
import com.scrumku.scrumapp.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/public/v1/assignee-registration")
@RequiredArgsConstructor
public class AssigneeRegistrationController {
    
    private final AssigneeRegistrationService assigneeRegistrationService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AssigneeRegistrationResponse>> registerAssignee(
            @Valid @RequestBody AssigneeRegistrationRequest request) {
        
        log.info("Received assignee registration request for email: {}", request.getEmail());
        
        ApiResponse<AssigneeRegistrationResponse> response = assigneeRegistrationService.registerAssignee(request);
        
        // Return appropriate HTTP status based on success/failure
        int statusCode = response.getSuccess() ? 200 : 400;
        
        return ResponseEntity.status(statusCode).body(response);
    }
}
