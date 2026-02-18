package com.remnika.backend.controller;

import com.remnika.backend.entity.User;
import com.remnika.backend.service.ComplianceService;
import com.remnika.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final UserService userService;
    private final ComplianceService complianceService;

    @PostMapping("/transfer")
    public ResponseEntity<?> transferFunds(@RequestBody Map<String, Object> request, Principal principal) {
        // Now this method will be found!
        User user = userService.getUserByEmail(principal.getName());

        // Process 3.3.1: AML Check
        if (!complianceService.passesAmlScreening(user)) {
            return ResponseEntity.status(403).body(Map.of("error", "Blocked by AML Compliance."));
        }

        // Process 3.3.2: Transaction Limit Validation
        try {
            java.math.BigDecimal amount = new java.math.BigDecimal(request.get("amount").toString());
            complianceService.validateTransactionLimit(user, amount);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Compliance checks passed!"));
    }
}