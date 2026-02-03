package com.mapic.backend.services;

import com.mapic.backend.dtos.*;
import com.mapic.backend.entities.Place;
import com.mapic.backend.repositories.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceService {
    
    private final PlaceRepository placeRepository;

    @Transactional(readOnly = true)
    public List<PlaceResponse> searchPlaces(PlaceSearchRequest request) {
        List<Place> places;
        
        if (request.getQuery() != null && !request.getQuery().isEmpty()) {
            places = placeRepository.searchByQueryAndCategory(
                request.getQuery(), 
                request.getCategory()
            );
        } else if (request.getCategory() != null) {
            places = placeRepository.findByCategory(request.getCategory());
        } else {
            places = placeRepository.findAll();
        }
        
        // Calculate distances and filter by radius
        List<PlaceResponse> responses = places.stream()
            .map(place -> {
                PlaceResponse response = PlaceResponse.builder()
                    .id(place.getId())
                    .name(place.getName())
                    .category(place.getCategory())
                    .address(place.getAddress())
                    .latitude(place.getLatitude())
                    .longitude(place.getLongitude())
                    .phone(place.getPhone())
                    .description(place.getDescription())
                    .imageUrl(place.getImageUrl())
                    .rating(place.getRating())
                    .openingHours(place.getOpeningHours())
                    .build();
                
                // Calculate distance if user location provided
                if (request.getLatitude() != null && request.getLongitude() != null) {
                    double distance = calculateDistance(
                        request.getLatitude(), request.getLongitude(),
                        place.getLatitude(), place.getLongitude()
                    );
                    response.setDistance(distance);
                }
                
                return response;
            })
            .filter(response -> {
                // Filter by radius
                if (request.getRadius() != null && response.getDistance() != null) {
                    return response.getDistance() <= request.getRadius();
                }
                return true;
            })
            .sorted(Comparator.comparing(PlaceResponse::getDistance, 
                Comparator.nullsLast(Comparator.naturalOrder())))
            .collect(Collectors.toList());
        
        return responses;
    }

    @Transactional(readOnly = true)
    public PlaceResponse getPlaceById(Long placeId, Double userLat, Double userLon) {
        Place place = placeRepository.findById(placeId)
            .orElseThrow(() -> new RuntimeException("Place not found"));
        
        PlaceResponse response = PlaceResponse.builder()
            .id(place.getId())
            .name(place.getName())
            .category(place.getCategory())
            .address(place.getAddress())
            .latitude(place.getLatitude())
            .longitude(place.getLongitude())
            .phone(place.getPhone())
            .description(place.getDescription())
            .imageUrl(place.getImageUrl())
            .rating(place.getRating())
            .openingHours(place.getOpeningHours())
            .build();
        
        if (userLat != null && userLon != null) {
            double distance = calculateDistance(userLat, userLon, 
                place.getLatitude(), place.getLongitude());
            response.setDistance(distance);
        }
        
        return response;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
}
