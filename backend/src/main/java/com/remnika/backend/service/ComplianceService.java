package com.remnika.backend.service;

import com.remnika.backend.entity.User;
import com.remnika.backend.repository.TransactionLogRepository;
import com.remnika.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplianceService {

    private final TransactionLogRepository transactionLogRepository;
    private final WalletRepository walletRepository;

    /**
     * Process 3.3.1: AML Screening
     */
    public boolean passesAmlScreening(User user) {
        String country = user.getCountry().toUpperCase();
        return !List.of("NORTH_KOREA", "IRAN").contains(country);
    }

    /**
     * Process 3.3.2: Transaction Limit Validation
     */
    /**
     * Process 3.3.2: Transaction Limit Validation
     */
    public void validateTransactionLimit(User user, BigDecimal newAmount) {
        BigDecimal dailyLimit = new BigDecimal("1000.00");
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);

        // Get user's wallet
        com.remnika.backend.entity.Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));

        // Sum of transfers in last 24h (will be negative)
        BigDecimal currentUsage = transactionLogRepository.getDailyTransferTotal(wallet.getId(), twentyFourHoursAgo);

        // Convert to positive for comparison
        BigDecimal usedAmount = currentUsage.abs();

        if (usedAmount.add(newAmount).compareTo(dailyLimit) > 0) {
            throw new RuntimeException("Transaction failed: Daily limit of $1000.00 exceeded.");
        }
    }

    /**
     * Process 3.3.3: Risk Scoring logic
     * Controller ekhane 'getRiskScore' call korchhe, tai ei nam-e thaka dorkar.
     */
    public int getRiskScore(User user) {
        int score = 0;

        // Agar user verified na hoy, risk bere jabe
        if (!user.isVerified()) {
            score += 40;
        }

        // KYC status onujayi scoring
        if ("PENDING".equals(user.getKycStatus())) {
            score += 20;
        } else if ("REJECTED".equals(user.getKycStatus())) {
            score += 80;
        }

        return score;
    }
}