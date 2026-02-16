package com.remnika.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Connects the log to the D4 Wallet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    // Use BigDecimal for high precision across 17 currencies
    @Column(precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency; // e.g., INR, EUR, SEK

    @Column(nullable = false)
    private String transactionType; // e.g., "DEPOSIT", "TRANSFER_OUT"

    @Column(nullable = false)
    private String status;          // e.g., "SUCCESS", "FAILED", "PENDING"

    @Column(unique = true)
    private String gatewayReference; // External reference from Bank/Gateway

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Automatically sets the timestamp before saving to the database.
     * This ensures the D5 Store has accurate audit records.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}