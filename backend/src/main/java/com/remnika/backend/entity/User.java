package com.remnika.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fullName; // Added for Process 1.1

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String country; // Required for Wallet Currency assignment

    private String deviceId; // Used for Session management in D2

    // --- OTP & Verification (Process 1.2) ---
    private String otp;
    private LocalDateTime otpExpiry;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean isVerified = false; // Ensures new users are unverified by default

    // --- KYC Compliance (Process 3.1) ---
    @Builder.Default
    @Column(name = "kyc_status", columnDefinition = "varchar(255) default 'NOT_SUBMITTED'")
    private String kycStatus = "NOT_SUBMITTED"; // Initial state for Process 3.1

    // --- Auditing Timestamps ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}