package com.remnika.backend.repository;

import com.remnika.backend.entity.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog, UUID> {
    // Retrieves all logs for a specific wallet, sorted by most recent first
    List<TransactionLog> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionLog t " +
            "WHERE t.wallet.id = :walletId " +
            "AND t.createdAt >= :since " +
            "AND t.amount < 0 " + // Only count outgoing (deductions)
            "AND t.transactionType = 'TRANSFER_SENT'") // Specifically transfers
    java.math.BigDecimal getDailyTransferTotal(
            @org.springframework.data.repository.query.Param("walletId") UUID walletId,
            @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}