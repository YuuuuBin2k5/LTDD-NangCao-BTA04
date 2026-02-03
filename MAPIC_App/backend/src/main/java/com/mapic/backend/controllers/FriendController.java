package com.mapic.backend.controllers;

import com.mapic.backend.dtos.*;
import com.mapic.backend.services.FriendService;
import com.mapic.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendController {
    
    private final FriendService friendService;
    private final JwtUtil jwtUtil;

    @PostMapping("/search")
    public ResponseEntity<List<FriendResponse>> searchFriends(
            @RequestHeader("Authorization") String token,
            @RequestBody FriendSearchRequest request) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        List<FriendResponse> friends = friendService.searchFriends(userId, request);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/list")
    public ResponseEntity<List<FriendResponse>> getFriendsList(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String activityStatus,
            @RequestParam(required = false) Double maxDistance,
            @RequestParam(required = false) Double userLatitude,
            @RequestParam(required = false) Double userLongitude) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        
        FriendSearchRequest request = new FriendSearchRequest();
        request.setStatus(status);
        request.setActivityStatus(activityStatus);
        request.setMaxDistance(maxDistance);
        request.setUserLatitude(userLatitude);
        request.setUserLongitude(userLongitude);
        
        List<FriendResponse> friends = friendService.searchFriends(userId, request);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/{friendId}/profile")
    public ResponseEntity<FriendProfileResponse> getFriendProfile(
            @RequestHeader("Authorization") String token,
            @PathVariable Long friendId,
            @RequestParam(required = false) Double userLatitude,
            @RequestParam(required = false) Double userLongitude) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        FriendProfileResponse profile = friendService.getFriendProfile(
            userId, friendId, userLatitude, userLongitude);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Void>> addFriend(
            @RequestHeader("Authorization") String token,
            @RequestBody AddFriendRequest request) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        ApiResponse<Void> response = friendService.addFriend(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{friendshipId}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptFriendRequest(
            @RequestHeader("Authorization") String token,
            @PathVariable Long friendshipId) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        ApiResponse<Void> response = friendService.acceptFriendRequest(userId, friendshipId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> removeFriend(
            @RequestHeader("Authorization") String token,
            @PathVariable Long friendId) {
        
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        ApiResponse<Void> response = friendService.removeFriend(userId, friendId);
        return ResponseEntity.ok(response);
    }
}
