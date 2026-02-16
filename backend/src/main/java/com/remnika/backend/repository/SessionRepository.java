package com.remnika.backend.repository;

import com.remnika.backend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional; // Add this import
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByUserId(UUID userId);
    Optional<Session> findByToken(String token);
}