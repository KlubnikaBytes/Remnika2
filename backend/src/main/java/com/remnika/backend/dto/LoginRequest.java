package com.remnika.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;       // Optional (User fills this OR phone)
    private String phoneNumber; // Optional (User fills this OR email)
    private String password;    // Required
    private String otpMethod;   // Optional: "EMAIL" or "PHONE"
}