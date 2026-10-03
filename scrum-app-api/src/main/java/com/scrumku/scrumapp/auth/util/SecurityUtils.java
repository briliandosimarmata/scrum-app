package com.scrumku.scrumapp.auth.util;

import com.scrumku.scrumapp.auth.dto.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {
    
    /**
     * Get the current authenticated user from SecurityContext
     * @return CurrentUser object containing user information
     * @throws RuntimeException if user is not authenticated or user details are not of expected type
     */
    public static CurrentUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        if (!(authentication.getPrincipal() instanceof CurrentUser)) {
            throw new RuntimeException("Invalid user details type");
        }
        
        return (CurrentUser) authentication.getPrincipal();
    }
    
    /**
     * Get the current user's ID
     * @return UUID of the current user
     * @throws RuntimeException if user is not authenticated
     */
    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }
    
    /**
     * Get the current user's email
     * @return email of the current user
     * @throws RuntimeException if user is not authenticated
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }
}
