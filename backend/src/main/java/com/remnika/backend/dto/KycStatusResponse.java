package com.remnika.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class KycStatusResponse {
    private String email;
    private String kycStatus;
    private boolean isVerified;
    private LocalDateTime submittedAt;
}
