package com.remnika.backend.service;

import com.onfido.api.DefaultApi;
import com.onfido.model.*; // Singular 'model' package for v6.7.0
import com.onfido.FileTransfer; // Required for uploads in SDK 6.x/7.x
import com.remnika.backend.entity.KycDocument;
import com.remnika.backend.entity.User;
import com.remnika.backend.repository.KycDocumentRepository;
import com.remnika.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KycService {
    private final DefaultApi onfidoClient;
    private final KycDocumentRepository kycRepository;
    private final UserRepository userRepository;

    @Value("${remnika.app.kycMode:REAL}") // Default to REAL, can be set to DUMMY
    private String kycMode;

    private final String uploadDir = "uploads/kyc/";

    /**
     * Process 3.1: KYC Submission
     * Captures and stores documents in the local D6 Document Store.
     */
    public void submitKyc(User user, String type, String docNum,
            MultipartFile front, MultipartFile back, MultipartFile selfie) throws IOException {
        Files.createDirectories(Paths.get(uploadDir));

        String frontPath = saveFile(front, user.getId() + "_front");
        String backPath = (back != null && !back.isEmpty()) ? saveFile(back, user.getId() + "_back") : null;
        String selfiePath = saveFile(selfie, user.getId() + "_selfie");

        java.util.Optional<KycDocument> existingKyc = kycRepository.findByUser(user);

        KycDocument kyc;
        if (existingKyc.isPresent()) {
            kyc = existingKyc.get();
            kyc.setDocumentType(type);
            kyc.setDocumentNumber(docNum);
            kyc.setFrontImagePath(frontPath);
            kyc.setBackImagePath(backPath);
            kyc.setSelfieImagePath(selfiePath);
            // submittedAt updates automatically on persist? No, strictly only on create.
            // We might want to update it manually or leave it.
            // Let's explicitly update it if we want to track resubmission.
            kyc.setSubmittedAt(java.time.LocalDateTime.now());
        } else {
            kyc = KycDocument.builder()
                    .user(user)
                    .documentType(type)
                    .documentNumber(docNum)
                    .frontImagePath(frontPath)
                    .backImagePath(backPath)
                    .selfieImagePath(selfiePath)
                    .build();
        }

        kycRepository.save(kyc);

        // Process 3.2.3: Update D1 User Database Status
        user.setKycStatus("PENDING");
        userRepository.save(user);
    }

    /**
     * Process 3.2.1: Handover to Onfido (KYC Provider)
     * Bridges local D6 storage with the external Onfido Cloud.
     * Supports DUMMY mode to skip external API calls while testing.
     */
    public void verifyWithOnfido(User user, KycDocument kycDocs) throws Exception {
        if ("DUMMY".equalsIgnoreCase(kycMode)) {
            // Logic for testing without a real API key
            System.out.println("KYC DUMMY MODE: Simulating Onfido submission for " + user.getEmail());
            user.setKycStatus("PENDING_VERIFICATION");
            userRepository.save(user);
            return;
        }

        // 1. Create Applicant on Onfido Platform
        Applicant applicant = onfidoClient.createApplicant(new ApplicantBuilder()
                .firstName(user.getFullName())
                .lastName("Customer") // lastName is mandatory in SDK 6.x
                .email(user.getEmail()));

        // 2. Upload Front ID (Process 3.2.1)
        // SDK 6.7.0 requires 8 parameters
        onfidoClient.uploadDocument(
                DocumentTypes.PASSPORT,
                applicant.getId(),
                new FileTransfer(new File(kycDocs.getFrontImagePath())),
                null, null, null, null, null);

        // 3. Create Verification Check with Enum-based ReportNames
        onfidoClient.createCheck(new CheckBuilder()
                .applicantId(applicant.getId())
                .reportNames(List.of(ReportName.DOCUMENT, ReportName.FACIAL_SIMILARITY_PHOTO)));
    }

    private String saveFile(MultipartFile file, String suffix) throws IOException {
        String fileName = suffix + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return filePath.toString();
    }
}