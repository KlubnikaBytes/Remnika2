package com.remnika.backend.config;

import com.remnika.backend.entity.User;
import com.remnika.backend.entity.Wallet;
import com.remnika.backend.repository.UserRepository;
import com.remnika.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createDemoRecipient();
    }

    private void createDemoRecipient() {
        String email = "demo@remnika.com";
        if (userRepository.existsByEmail(email)) {
            return;
        }

        System.out.println("Creating Demo User...");

        User user = User.builder()
                .fullName("Demo Recipient")
                .email(email)
                .phoneNumber("+15550000000")
                .password(passwordEncoder.encode("password123"))
                .country("USA")
                .deviceId("demo-device")
                .otp(null)
                .otpExpiry(null)
                .isVerified(true)
                .build();

        userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(user)
                .currency("USD")
                .balance(new BigDecimal("1000.0000"))
                .accountNumber("1234567890") // Fixed Account Number
                .build();

        walletRepository.save(wallet);

        System.out.println("Demo User Created. Account: 1234567890, Email: demo@remnika.com");
    }
}
