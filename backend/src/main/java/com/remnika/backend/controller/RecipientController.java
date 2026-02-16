package com.remnika.backend.controller;

import com.remnika.backend.dto.RecipientRequest;
import com.remnika.backend.entity.Recipient;
import com.remnika.backend.service.RecipientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recipients")
@RequiredArgsConstructor
public class RecipientController {

    private final RecipientService recipientService;

    @PostMapping("/add")
    public ResponseEntity<String> addRecipient(@RequestBody RecipientRequest request) {
        return ResponseEntity.ok(recipientService.addRecipient(request));
    }

    @GetMapping("/my-list")
    public ResponseEntity<List<Recipient>> getRecipients() {
        return ResponseEntity.ok(recipientService.getMyRecipients());
    }
}