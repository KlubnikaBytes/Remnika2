package com.remnika.backend.service;

import com.remnika.backend.config.JwtUtils;
import com.remnika.backend.dto.LoginRequest;
import com.remnika.backend.dto.RegisterRequest;
import com.remnika.backend.entity.Session;
import com.remnika.backend.entity.User;
import com.remnika.backend.entity.Wallet;
import com.remnika.backend.repository.SessionRepository;
import com.remnika.backend.repository.UserRepository;
import com.remnika.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.Map;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class UserService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SmsService smsService;
    private final JwtUtils jwtUtils;

    // Process 2.1.2: Global Currency Mapping for all 17 countries
    private static final Map<String, String> COUNTRY_CURRENCY_MAP = Map.ofEntries(
            Map.entry("Ireland", "EUR"), Map.entry("Sweden", "SEK"), Map.entry("Denmark", "DKK"),
            Map.entry("Norway", "NOK"), Map.entry("India", "INR"), Map.entry("Bangladesh", "BDT"),
            Map.entry("Nepal", "NPR"), Map.entry("China", "CNY"), Map.entry("Philippines", "PHP"),
            Map.entry("Benin", "XOF"), Map.entry("Rwanda", "RWF"), Map.entry("Zambia", "ZMW"),
            Map.entry("Canada", "CAD"), Map.entry("Argentina", "ARS"), Map.entry("USA", "USD"),
            Map.entry("Poland", "PLN"), Map.entry("Greece", "EUR"));

    // --- 1. Registration Logic (Process 1.1) ---
    // --- 1. Registration Logic (Process 1.1) ---
    public String registerUser(RegisterRequest request) {
        System.out.println("Processing registration for email: " + request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            System.out.println("Email already exists: " + request.getEmail());
            throw new RuntimeException("Email already taken!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            System.out.println("Phone already exists: " + request.getPhoneNumber());
            throw new RuntimeException("Phone number already in use!");
        }

        User user = User.builder()
                .fullName(request.getFullName()) // NEW: Map the name here
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .country(request.getCountry())
                .deviceId(request.getDeviceId())
                .otp(generateOtp())
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .isVerified(false)
                .build();

        userRepository.save(user);
        System.out.println("User saved successfully. Sending OTP...");

        sendOtpToUser(user, request.getOtpMethod());
        System.out.println("OTP sent.");

        return "OTP sent for verification.";
    }

    // --- 2. Login Logic ---
    public String loginUser(LoginRequest request) {
        User user;

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with this email"));
        } else if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                    .orElseThrow(() -> new RuntimeException("User not found with this phone number"));
        } else {
            throw new RuntimeException("Please provide Email or Phone Number");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password!");
        }

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Determine OTP method: explicit choice > inferred from login identifier
        String method = request.getOtpMethod();
        if (method == null || method.isEmpty()) {
            // Fallback: If they logged in with Phone, send SMS. If Email, send Email.
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
                method = "PHONE";
            } else {
                method = "EMAIL";
            }
        }

        // Execute sending based on determined method
        if ("PHONE".equalsIgnoreCase(method)) {
            if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
                // Fallback if they asked for Phone but don't have one? Or throw error?
                // Let's throw reasonable error or fallback to email.
                // For security, if they requested PHONE, we should try PHONE.
                throw new RuntimeException("No phone number registered for this account.");
            }
            smsService.sendOtpSms(user.getPhoneNumber(), otp);
            return "OTP sent to your Phone (" + user.getPhoneNumber() + ")";
        } else {
            // Default to Email
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                throw new RuntimeException("No email registered for this account.");
            }
            emailService.sendOtpEmail(user.getEmail(), otp);
            return "OTP sent to your Email (" + user.getEmail() + ")";
        }
    }

    // --- 3. Verify OTP, Generate Token & Initialize Wallet ---
    public String verifyOtp(String identifier, String otp, boolean isPhone) {
        User user;

        if (isPhone) {
            user = userRepository.findByPhoneNumber(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP Expired");
        }

        user.setVerified(true);
        user.setOtp(null);
        userRepository.save(user);

        // --- PROCESS 2.1 WALLET CREATION BRIDGE ---
        initializeUserWallet(user);

        String token = jwtUtils.generateJwtToken(user.getEmail());
        createSession(user, token);

        return token;
    }

    public void logoutUser(String token) {
        Session session = sessionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Session not found or already logged out"));

        session.setActive(false);
        sessionRepository.save(session);
    }

    // --- Helper Methods ---

    /**
     * Helper for Process 2.1: Assigns currency and initializes balance to zero.
     * PUBLIC to allow lazy initialization from Controller.
     */
    public void initializeUserWallet(User user) {
        if (!walletRepository.existsByUserId(user.getId())) {
            // Process 2.1.2: Dynamic Currency Assignment based on user country
            String currency = COUNTRY_CURRENCY_MAP.getOrDefault(user.getCountry(), "USD");

            Wallet wallet = Wallet.builder()
                    .user(user)
                    .currency(currency) // 2.1.2 Assign Local Currency
                    .balance(BigDecimal.ZERO) // 2.1.3 Initialize Balance to 0.00
                    .accountNumber(generateAccountNumber())
                    .build();

            walletRepository.save(wallet);
        }
    }

    private String generateAccountNumber() {
        return String.valueOf((long) (Math.random() * 9000000000L) + 1000000000L);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private void sendOtpToUser(User user, String method) {
        if ("PHONE".equalsIgnoreCase(method)) {
            smsService.sendOtpSms(user.getPhoneNumber(), user.getOtp());
        } else {
            emailService.sendOtpEmail(user.getEmail(), user.getOtp());
        }
    }

    private void createSession(User user, String token) {
        Session session = Session.builder()
                .user(user)
                .token(token)
                .deviceId(user.getDeviceId())
                .loginTime(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .isActive(true)
                .build();

        sessionRepository.save(session);
    }

    // --- 4. Forgot Password Logic ---

    /**
     * Step 1: Initiate Forgot Password.
     * Sends an OTP to the user's chosen method (Email/Phone).
     */
    public String initiateForgotPassword(String identifier, String method) {
        User user = ("PHONE".equalsIgnoreCase(method))
                ? userRepository.findByPhoneNumber(identifier)
                        .orElseThrow(() -> new RuntimeException("Phone not found"))
                : userRepository.findByEmail(identifier).orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        sendOtpToUser(user, method);
        return "OTP sent to " + method + " for password reset.";
    }

    /**
     * Step 2: Verify Forgot Password OTP.
     * Returns a temporary "Reset Token" or simple success if OTP is valid.
     */
    public boolean verifyResetOtp(String identifier, String otp, boolean isPhone) {
        User user = isPhone
                ? userRepository.findByPhoneNumber(identifier).orElseThrow(() -> new RuntimeException("User not found"))
                : userRepository.findByEmail(identifier).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP Expired");
        }

        // Clear OTP after successful verification
        user.setOtp(null);
        userRepository.save(user);
        return true;
    }

    /**
     * Step 3: Update Password.
     * Sets the new password after the user re-enters it on the frontend.
     */
    public String updatePassword(String identifier, String newPassword, boolean isPhone) {
        User user = isPhone
                ? userRepository.findByPhoneNumber(identifier).orElseThrow(() -> new RuntimeException("User not found"))
                : userRepository.findByEmail(identifier).orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password updated successfully! Please login with your new credentials.";
    }
}