package com.remnika.backend.repository;

import com.remnika.backend.entity.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecipientRepository extends JpaRepository<Recipient, UUID> {
    // Fetches all recipients belonging to a specific user
    List<Recipient> findByUserId(UUID userId);
}