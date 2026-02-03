package com.mapic.backend.controllers;

import com.mapic.backend.dtos.*;
import com.mapic.backend.services.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {
    
    private final PlaceService placeService;

    @PostMapping("/search")
    public ResponseEntity<List<PlaceResponse>> searchPlaces(
            @RequestBody PlaceSearchRequest request) {
        List<PlaceResponse> places = placeService.searchPlaces(request);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<PlaceResponse>> getNearbyPlaces(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5000") Double radius,
            @RequestParam(required = false) String category) {
        
        PlaceSearchRequest request = new PlaceSearchRequest();
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setRadius(radius);
        request.setCategory(category);
        
        List<PlaceResponse> places = placeService.searchPlaces(request);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/{placeId}")
    public ResponseEntity<PlaceResponse> getPlaceById(
            @PathVariable Long placeId,
            @RequestParam(required = false) Double userLatitude,
            @RequestParam(required = false) Double userLongitude) {
        
        PlaceResponse place = placeService.getPlaceById(placeId, userLatitude, userLongitude);
        return ResponseEntity.ok(place);
    }
}
