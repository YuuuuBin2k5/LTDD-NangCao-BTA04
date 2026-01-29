package com.mapic.backend.services;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    public void sendEmail(String to, String subject, String body) {
        // Tạm thời log email thay vì gửi thật
        System.out.println("=== EMAIL SENT ===");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("==================");
    }
}