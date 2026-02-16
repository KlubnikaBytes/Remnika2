package com.remnika.backend.controller;

import com.remnika.backend.entity.User;
import com.remnika.backend.entity.Wallet;
import com.remnika.backend.repository.UserRepository;
import com.remnika.backend.repository.WalletRepository;
import com.remnika.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final WalletService walletService;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Object> data) {
        if (!data.containsKey("amount")) {
            throw new RuntimeException("Amount is required");
        }
        String mockOrderID = "order_" + UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(Map.of("gatewayOrderId", mockOrderID, "status", "created"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> result) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElseThrow();

        BigDecimal amount = new BigDecimal(result.get("amount"));
        String ref = result.get("paymentId");

        walletService.addMoney(wallet, amount, ref);

        return ResponseEntity.ok("Balance updated successfully!");
    }
}