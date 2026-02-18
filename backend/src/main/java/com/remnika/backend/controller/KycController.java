package com.remnika.backend.controller;

import com.remnika.backend.entity.User;
import com.remnika.backend.repository.UserRepository;
import com.remnika.backend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {
    private final KycService kycService;
    private final UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<String> submitKyc(
            @RequestParam("type") String type,
            @RequestParam("docNum") String docNum,
            @RequestParam("front") MultipartFile front,
            @RequestParam(value = "back", required = false) MultipartFile back,
            @RequestParam("selfie") MultipartFile selfie) {

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow();

            kycService.submitKyc(user, type, docNum, front, back, selfie);
            return ResponseEntity.ok("KYC submitted successfully. Status: PENDING.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading KYC: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<com.remnika.backend.dto.KycStatusResponse> getKycStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        com.remnika.backend.dto.KycStatusResponse response = com.remnika.backend.dto.KycStatusResponse.builder()
                .email(user.getEmail())
                .kycStatus(user.getKycStatus())
                .isVerified(user.isVerified())
                .submittedAt(user.getUpdatedAt()) // Assuming last update relates to KYC submission or status change
                .build();

        return ResponseEntity.ok(response);
    }
}
