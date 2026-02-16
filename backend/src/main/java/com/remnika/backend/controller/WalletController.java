package com.remnika.backend.controller;

import com.remnika.backend.entity.User;
import com.remnika.backend.entity.Wallet;
import com.remnika.backend.entity.TransactionLog; // NEW: Fixes image_b27d1d.png
import com.remnika.backend.repository.UserRepository;
import com.remnika.backend.repository.WalletRepository;
import com.remnika.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List; // NEW: Fixes image_b27d1d.png
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final com.remnika.backend.service.UserService userService;

    /**
     * Process 2.3.1: Get Available Balance
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Lazy Initialization: Create wallet if not exists
                    userService.initializeUserWallet(user);
                    return walletRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new RuntimeException("Failed to initialize wallet"));
                });

        return ResponseEntity.ok(Map.of(
                "currency", wallet.getCurrency(),
                "balance", wallet.getBalance(),
                "accountNumber", wallet.getAccountNumber() != null ? wallet.getAccountNumber() : "N/A"));
    }

    /**
     * D5: Get Transaction History
     */
    @GetMapping("/history")
    public ResponseEntity<List<TransactionLog>> getHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<TransactionLog> history = walletService.getTransactionHistory(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createWallet() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userService.initializeUserWallet(user);
        return ResponseEntity.ok("Wallet initialized successfully!");
    }
}