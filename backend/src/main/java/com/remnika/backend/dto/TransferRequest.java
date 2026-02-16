package com.remnika.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    private String recipientAccountNumber;
    private BigDecimal amount;
    private String description;
}
