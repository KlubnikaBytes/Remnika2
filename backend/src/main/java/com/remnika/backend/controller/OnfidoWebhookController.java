package com.remnika.backend.controller;

import org.springframework.web.bind.annotation.*; // Adds @RestController, @PostMapping
import org.springframework.http.ResponseEntity;   // Adds ResponseEntity
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/webhooks/onfido")
@RequiredArgsConstructor
public class OnfidoWebhookController {

    @PostMapping
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload,
                                              @RequestHeader("X-SHA2-Signature") String signature) {
        // Result listener for Process 3.2.2
        return ResponseEntity.ok().build();
    }
}