package com.mapic.backend.dtos;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    
    // Constructor cho success response với data
    public static <T> ApiResponse<T> successWithData(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }
    
    // Constructor cho success response không có data
    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>("success", message, null);
    }
    
    // Constructor cho error response
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null);
    }
}
