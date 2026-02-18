package com.remnika.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskScoreResponse {
    private String email;
    private int riskScore;
    private String level; // LOW, MEDIUM, HIGH
}
