package com.remnika.backend.controller;

import com.remnika.backend.dto.TransferRequest;
import com.remnika.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final WalletService walletService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@RequestBody TransferRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Debug logging
            System.out.println("Transfer Request Received:");
            System.out.println("  From: " + email);
            System.out.println("  To Account: " + request.getRecipientAccountNumber());
            System.out.println("  Amount: " + request.getAmount());
            System.out.println("  Description: " + request.getDescription());
            
            walletService.transferFunds(email, request);
            
            System.out.println("Transfer Successful!");
            return ResponseEntity.ok(java.util.Map.of("message", "Transfer successful!"));
            
        } catch (RuntimeException e) {
            // Log the error for backend debugging
            System.err.println("Transfer Failed: " + e.getMessage());
            e.printStackTrace();
            
            // Return structured error response for frontend
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
