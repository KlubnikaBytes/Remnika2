package com.remnika.backend.service;

import com.remnika.backend.dto.RecipientRequest;
import com.remnika.backend.entity.Recipient;
import com.remnika.backend.entity.User;
import com.remnika.backend.repository.RecipientRepository;
import com.remnika.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class RecipientService {

    private final RecipientRepository recipientRepository;
    private final UserRepository userRepository;

    /**
     * Process 1.3.1 & 1.3.2: Identifies user and validates recipient details
     * against global standards.
     * Process 1.3.3: Stores the profile in the D3 Recipient Database.
     */
    public String addRecipient(RecipientRequest request) {
        // 1.3.1 Identify Authenticated User via JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User session not found"));

        // 1.3.2 Validate Recipient Details based on Country
        validateRecipientData(request);

        // 1.3.3 Store Recipient Profile in D3 Store
        Recipient recipient = Recipient.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .country(request.getCountry())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .build();

        recipientRepository.save(recipient);
        return "Recipient profile stored successfully!";
    }

    /**
     * Implementation of Process 1.3.2: Validates bank details for 17 countries.
     */
    private void validateRecipientData(RecipientRequest request) {
        String country = request.getCountry();
        String acc = request.getAccountNumber();

        if (country == null || acc == null || acc.isEmpty()) {
            throw new RuntimeException("Validation Failed: Country and Account Number are required.");
        }

        // Sanitize input based on country
        if (country != null && acc != null) {
            switch (country) {
                case "USA", "India", "UK", "United States", "United Kingdom", "China", "Canada":
                    // Remove all non-numeric characters (dashes, spaces, etc.)
                    acc = acc.replaceAll("[^0-9]", "");
                    break;
                case "Ireland", "Sweden", "Denmark", "Norway", "Poland", "Greece", "European Union", "EU":
                    // Remove spaces and dashes for IBAN
                    acc = acc.replaceAll("[\\s-]", "");
                    break;
                default:
                    acc = acc.trim();
            }
            // Update request object or use local variable for validation
            // Since request is used later for saving, we should update the DTO if possible
            // or create a new Recipient with sanitized data.
            // But DTO setters might not be available or we want to keep original request
            // clean?
            // Actually, we should store the sanitized version.
            request.setAccountNumber(acc);
        }

        if (country == null || acc == null || acc.isEmpty()) {
            throw new RuntimeException("Validation Failed: Country and Account Number are required.");
        }

        switch (country) {
            case "Ireland", "Sweden", "Denmark", "Norway", "Poland", "Greece", "European Union", "EU":
                // Europe uses IBAN (Starts with 2-letter country code)
                if (!Pattern.matches("^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$", acc)) {
                    throw new RuntimeException("Invalid IBAN format for " + country);
                }
                break;
            case "India":
                // India: Requires standard account length
                if (acc.length() < 9 || acc.length() > 18) {
                    throw new RuntimeException("Invalid Indian Bank Account length.");
                }
                break;
            case "USA", "United States":
                // USA: Standard 9-digit Routing/Account patterns
                if (!Pattern.matches("^\\d{7,12}$", acc)) {
                    throw new RuntimeException("Invalid USA Account Number.");
                }
                break;
            case "United Kingdom", "UK":
                if (!Pattern.matches("^\\d{8}$", acc)) {
                    throw new RuntimeException("Invalid UK Account Number.");
                }
                break;
            case "Canada":
                // Canada: Requires Transit (5 digits) + Institution (3 digits) + Account
                if (acc.length() < 7) {
                    throw new RuntimeException("Invalid Canada Account/Transit format.");
                }
                break;
            case "China":
                // China: UnionPay cards are usually 16-19 digits
                if (!Pattern.matches("^\\d{16,19}$", acc)) {
                    throw new RuntimeException("Invalid China UnionPay/Account number.");
                }
                break;
            case "Bangladesh", "Nepal", "Philippines", "Benin", "Rwanda", "Zambia", "Argentina", "Mexico", "Kenya":
                // General validation for other regions
                if (acc.length() < 5) {
                    throw new RuntimeException("Account number too short for " + country);
                }
                break;
            default:
                throw new RuntimeException("Country " + country + " is not currently supported for transfers.");
        }
    }

    public List<Recipient> getMyRecipients() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return recipientRepository.findByUserId(user.getId());
    }
}