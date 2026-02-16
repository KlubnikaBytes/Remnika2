package com.remnika.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Print full stack trace for debugging
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage()); // Generic "error" key for frontend to consume
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
