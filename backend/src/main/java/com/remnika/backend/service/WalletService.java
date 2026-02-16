package com.remnika.backend.service;

import com.remnika.backend.entity.TransactionLog;
import com.remnika.backend.entity.User;
import com.remnika.backend.entity.Wallet;
import com.remnika.backend.repository.TransactionLogRepository;
import com.remnika.backend.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final com.remnika.backend.repository.UserRepository userRepository; // Inject UserRepo
    private final ExchangeRateService exchangeRateService; // Inject ExchangeRateService

    /**
     * Process 3: Transfer Funds (With Currency Conversion)
     */
    @Transactional
    public void transferFunds(String senderEmail, com.remnika.backend.dto.TransferRequest request) {
        // 1. Fetch Sender
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        Wallet senderWallet = walletRepository.findByUserId(sender.getId())
                .orElseThrow(() -> new RuntimeException("Sender wallet not found"));

        // 2. Fetch Recipient
        Wallet recipientWallet = walletRepository.findByAccountNumber(request.getRecipientAccountNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Recipient not found with account: " + request.getRecipientAccountNumber()));

        if (senderWallet.getId().equals(recipientWallet.getId())) {
            throw new RuntimeException("Cannot send money to yourself.");
        }

        // 3. Currency Conversion
        BigDecimal amountToSend = request.getAmount(); // Amount in Sender's Currency
        BigDecimal rate = exchangeRateService.getExchangeRate(senderWallet.getCurrency(),
                recipientWallet.getCurrency());
        BigDecimal amountToReceive = amountToSend.multiply(rate);
        
        System.out.println("Transfer Debug: " + amountToSend + " " + senderWallet.getCurrency() + " -> " + amountToReceive + " " + recipientWallet.getCurrency() + " (Rate: " + rate + ")");
        System.out.println("Sender Balance Before: " + senderWallet.getBalance());

        // 4. Validate Balance
        if (senderWallet.getBalance().compareTo(amountToSend) < 0) {
            String msg = "Insufficient balance. You have " + senderWallet.getCurrency() + " " + senderWallet.getBalance() + " but tried to send " + amountToSend;
            System.err.println(msg);
            throw new RuntimeException(msg);
        }

        // 5. Execute Transfer
        // Deduct from Sender
        senderWallet.setBalance(senderWallet.getBalance().subtract(amountToSend));
        walletRepository.save(senderWallet);

        // Add to Recipient
        recipientWallet.setBalance(recipientWallet.getBalance().add(amountToReceive));
        walletRepository.save(recipientWallet);

        // 6. Log Transactions
        String txnId = java.util.UUID.randomUUID().toString().substring(0, 8);
        
        // Sender Log
        transactionLogRepository.save(TransactionLog.builder()
                .wallet(senderWallet)
                .amount(amountToSend.negate())
                .currency(senderWallet.getCurrency())
                .transactionType("TRANSFER_SENT")
                .status("SUCCESS")
                .gatewayReference("TO: " + recipientWallet.getAccountNumber() + " [" + txnId + "]")
                .createdAt(LocalDateTime.now())
                .build());

        // Recipient Log
        transactionLogRepository.save(TransactionLog.builder()
                .wallet(recipientWallet)
                .amount(amountToReceive)
                .currency(recipientWallet.getCurrency())
                .transactionType("TRANSFER_RECEIVED")
                .status("SUCCESS")
                .gatewayReference("FROM: " + senderWallet.getAccountNumber() + " [" + txnId + "]")
                .createdAt(LocalDateTime.now())
                .build());
    }

    /**
     * Process 2.2.4: Updates the Wallet Balance (D4) and creates a Transaction Log
     * (D5) for deposits.
     */
    @Transactional
    public void addMoney(Wallet wallet, BigDecimal amount, String reference) {
        // 1. Update D4 Wallet Balance
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        // 2. Create D5 Transaction Log entry for deposit
        TransactionLog log = TransactionLog.builder()
                .wallet(wallet)
                .amount(amount)
                .currency(wallet.getCurrency())
                .transactionType("DEPOSIT")
                .status("SUCCESS")
                .gatewayReference(reference)
                .createdAt(LocalDateTime.now())
                .build();

        transactionLogRepository.save(log);
    }

    /**
     * Process 3.1: Transaction Execution (Deduction).
     * Deducts funds from the sender's wallet and records the event in the D5
     * Transaction Log.
     */
    @Transactional
    public void deductMoney(Wallet wallet, BigDecimal amount, String reference) {
        // 1. Validation: Ensure user has sufficient funds before deduction
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance for this transaction.");
        }

        // 2. Update D4 Wallet Balance (Subtract funds)
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // 3. Create D5 Transaction Log entry for outgoing transfer
        TransactionLog log = TransactionLog.builder()
                .wallet(wallet)
                .amount(amount)
                .currency(wallet.getCurrency())
                .transactionType("TRANSFER_OUT")
                .status("SUCCESS")
                .gatewayReference(reference)
                .createdAt(LocalDateTime.now())
                .build();

        transactionLogRepository.save(log);
    }

    /**
     * Retrieves the history of all deposits and transfers for a user from the D5
     * Store.
     */
    public List<TransactionLog> getTransactionHistory(User user) {
        // Identify the user's specific wallet from D4
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // Return logs sorted by most recent first
        return transactionLogRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }
}