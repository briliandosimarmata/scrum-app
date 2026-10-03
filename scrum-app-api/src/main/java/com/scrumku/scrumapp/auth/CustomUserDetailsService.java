package com.scrumku.scrumapp.auth;

import com.scrumku.scrumapp.auth.dto.CurrentUser;
import com.scrumku.scrumapp.auth.entity.User;
import com.scrumku.scrumapp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        return CurrentUser.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword()) // Include the password for authentication
                .build();
    }
}
