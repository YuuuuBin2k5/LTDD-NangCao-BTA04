package com.mapic.backend.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Backend is working!";
    }
    
    @GetMapping("/status")
    public String status() {
        return "MAPIC Backend v2.0 - OTP + JWT Ready";
    }
}