package com.mapic.backend.controllers;

import com.mapic.backend.dtos.ApiResponse;
import com.mapic.backend.entities.Friendship;
import com.mapic.backend.entities.User;
import com.mapic.backend.repositories.FriendshipRepository;
import com.mapic.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/test/friends")
@RequiredArgsConstructor
public class TestFriendController {
    
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(ApiResponse.successWithData(
                "Found " + users.size() + " users", 
                users
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/friendships")
    public ResponseEntity<?> getAllFriendships() {
        try {
            List<Friendship> friendships = friendshipRepository.findAll();
            return ResponseEntity.ok(ApiResponse.successWithData(
                "Found " + friendships.size() + " friendships", 
                friendships
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<?> checkUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(ApiResponse.successWithData(
                "User found: " + user.getFullName(), 
                user
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}
