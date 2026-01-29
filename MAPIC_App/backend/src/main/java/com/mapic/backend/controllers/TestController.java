package com.mapic.backend.controllers;

import com.mapic.backend.dtos.ApiResponse;
import com.mapic.backend.entities.User;
import com.mapic.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TestController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Create test users for development
     */
    @PostMapping("/seed-users")
    public ResponseEntity<ApiResponse<List<User>>> seedUsers() {
        try {
            log.info("Seeding test users...");
            
            // Check if users already exist
            if (userRepository.count() >= 4) {
                List<User> existingUsers = userRepository.findAll();
                return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                    .success(true)
                    .message("Users already exist")
                    .data(existingUsers)
                    .build());
            }
            
            String encodedPassword = passwordEncoder.encode("password123");
            
            User user1 = new User();
            user1.setEmail("dao@mapic.app");
            user1.setPassword(encodedPassword);
            user1.setFullName("Dao");
            user1.setActive(true);
            user1.setAvatarUrl("https://i.pravatar.cc/150?img=1");
            user1.setCreatedAt(LocalDateTime.now());
            user1.setUpdatedAt(LocalDateTime.now());
            
            User user2 = new User();
            user2.setEmail("minh@mapic.app");
            user2.setPassword(encodedPassword);
            user2.setFullName("Minh");
            user2.setActive(true);
            user2.setAvatarUrl("https://i.pravatar.cc/150?img=2");
            user2.setCreatedAt(LocalDateTime.now());
            user2.setUpdatedAt(LocalDateTime.now());
            
            User user3 = new User();
            user3.setEmail("hoa@mapic.app");
            user3.setPassword(encodedPassword);
            user3.setFullName("Hoa");
            user3.setActive(true);
            user3.setAvatarUrl("https://i.pravatar.cc/150?img=3");
            user3.setCreatedAt(LocalDateTime.now());
            user3.setUpdatedAt(LocalDateTime.now());
            
            User user4 = new User();
            user4.setEmail("nam@mapic.app");
            user4.setPassword(encodedPassword);
            user4.setFullName("Nam");
            user4.setActive(true);
            user4.setAvatarUrl("https://i.pravatar.cc/150?img=4");
            user4.setCreatedAt(LocalDateTime.now());
            user4.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);
            userRepository.save(user4);
            
            List<User> users = userRepository.findAll();
            log.info("Created {} test users", users.size());
            
            return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .success(true)
                .message("Test users created successfully")
                .data(users)
                .build());
                
        } catch (Exception e) {
            log.error("Error seeding users", e);
            return ResponseEntity.badRequest().body(ApiResponse.<List<User>>builder()
                .success(false)
                .message("Failed to seed users: " + e.getMessage())
                .build());
        }
    }
    
    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
            .success(true)
            .message("Users retrieved successfully")
            .data(users)
            .build());
    }
}
