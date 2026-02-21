package com.example.subscription.service;

import jakarta.annotation.PostConstruct;
import java.security.SecureRandom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Slf4j
public class AdminPinService {

    private static final int PIN_LENGTH = 6;

    @Value("${app.admin.pin:}")
    private String configuredPin;

    private String adminPin;

    @PostConstruct
    public void init() {
        if (configuredPin != null && !configuredPin.isBlank()) {
            adminPin = configuredPin.trim();
            log.info("Admin PIN loaded from environment configuration.");
            return;
        }

        adminPin = generateRandomPin();
        log.warn("Generated ADMIN PIN for this deployment: {}", adminPin);
        log.warn("Set APP_ADMIN_PIN to control it explicitly in production.");
    }

    public void validateOrThrow(String providedPin) {
        if (providedPin == null || providedPin.isBlank() || !adminPin.equals(providedPin.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin PIN");
        }
    }

    private String generateRandomPin() {
        SecureRandom random = new SecureRandom();
        StringBuilder pin = new StringBuilder(PIN_LENGTH);
        for (int i = 0; i < PIN_LENGTH; i++) {
            pin.append(random.nextInt(10));
        }
        return pin.toString();
    }
}
