package com.remnika.backend.repository;

import com.remnika.backend.entity.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, UUID> {
    java.util.Optional<KycDocument> findByUser(com.remnika.backend.entity.User user);
}