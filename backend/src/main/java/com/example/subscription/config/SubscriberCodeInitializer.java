package com.example.subscription.config;

import com.example.subscription.model.Subscriber;
import com.example.subscription.repository.SubscriberRepository;
import jakarta.annotation.PostConstruct;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SubscriberCodeInitializer {

    private final SubscriberRepository subscriberRepository;

    @PostConstruct
    @Transactional
    public void assignMissingCodes() {
        List<Subscriber> all = subscriberRepository.findAll();
        List<Subscriber> changed = new ArrayList<>();

        for (Subscriber subscriber : all) {
            if (subscriber.getCode() == null || subscriber.getCode().isBlank()) {
                subscriber.setCode(generateUniqueCode());
                changed.add(subscriber);
            }
        }

        if (!changed.isEmpty()) {
            subscriberRepository.saveAll(changed);
        }
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = "SUB-" + randomDigits(6);
        } while (subscriberRepository.existsByCode(code));
        return code;
    }

    private String randomDigits(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder result = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            result.append(random.nextInt(10));
        }
        return result.toString();
    }
}
