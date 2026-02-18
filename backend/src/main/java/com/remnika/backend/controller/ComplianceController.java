package com.remnika.backend.controller;

import com.remnika.backend.entity.User;
import com.remnika.backend.service.ComplianceService;
import com.remnika.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final UserService userService;
    private final ComplianceService complianceService;

    @GetMapping("/risk-score")
    public ResponseEntity<com.remnika.backend.dto.RiskScoreResponse> getRiskScore(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        int score = complianceService.getRiskScore(user);

        String level = "LOW";
        if (score >= 80)
            level = "HIGH";
        else if (score >= 40)
            level = "MEDIUM";

        return ResponseEntity.ok(com.remnika.backend.dto.RiskScoreResponse.builder()
                .email(user.getEmail())
                .riskScore(score)
                .level(level)
                .build());
    }
}