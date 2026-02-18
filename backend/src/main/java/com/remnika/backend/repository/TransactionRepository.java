package com.remnika.backend.repository;

import com.remnika.backend.entity.Transaction; // Now this will work!
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Process 3.3.2: Daily limit check query
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.createdAt >= :since")
    BigDecimal getSumOfTransactionsInLast24Hours(@Param("userId") java.util.UUID userId,
                                                 @Param("since") LocalDateTime since);
}