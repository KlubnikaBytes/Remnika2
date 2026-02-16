package com.remnika.backend.repository;

import com.remnika.backend.entity.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionLogRepository extends JpaRepository<TransactionLog, UUID> {
    // Retrieves all logs for a specific wallet, sorted by most recent first
    List<TransactionLog> findByWalletIdOrderByCreatedAtDesc(UUID walletId);
}