package com.scrumku.scrumapp.common.controller;

import com.scrumku.scrumapp.common.dto.ApiResponse;
import com.scrumku.scrumapp.common.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/public/v1")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponse>> health() {
        HealthResponse healthData = HealthResponse.builder()
                .status("UP")
                .timestamp(LocalDateTime.now())
                .service("scrum-app-api")
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(healthData));
    }
}