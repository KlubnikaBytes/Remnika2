package com.remnika.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recipients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recipient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Links recipient to the User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String firstName;
    private String lastName;
    private String country;     // For Process 1.3.2 validation
    private String bankName;    // For Process 1.3.2 validation
    private String accountNumber;
}