package com.example.subscription.service;

import com.example.subscription.dto.SubscriberRequest;
import com.example.subscription.model.Subscriber;
import com.example.subscription.model.Subscription;
import com.example.subscription.repository.SubscriberRepository;
import com.example.subscription.repository.SubscriptionRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriberService {

    private final SubscriberRepository subscriberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AdminPinService adminPinService;

    @Transactional
    public Subscriber create(SubscriberRequest request) {
        if (subscriberRepository.existsByEmailAndDeletedFalse(request.email())) {
            throw new IllegalArgumentException("Email already used");
        }
        Subscriber subscriber = new Subscriber();
        subscriber.setFirstName(request.firstName());
        subscriber.setLastName(request.lastName());
        subscriber.setEmail(request.email());
        subscriber.setPhone(request.phone());
        subscriber.setCode(generateUniqueCode());
        return subscriberRepository.save(subscriber);
    }

    public List<Subscriber> list(String search) {
        if (search == null || search.isBlank()) {
            return subscriberRepository.findAllByDeletedFalse();
        }
        return subscriberRepository.search(search);
    }

    @Transactional
    public Subscriber update(Long id, SubscriberRequest request) {
        Subscriber subscriber = subscriberRepository
            .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));

        if (subscriberRepository.existsByEmailAndIdNotAndDeletedFalse(request.email(), id)) {
            throw new IllegalArgumentException("Email already used");
        }

        subscriber.setFirstName(request.firstName());
        subscriber.setLastName(request.lastName());
        subscriber.setEmail(request.email());
        subscriber.setPhone(request.phone());
        return subscriberRepository.save(subscriber);
    }

    @Transactional
    public void delete(Long id) {
        Subscriber subscriber = subscriberRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));

        List<Subscription> subscriptions = subscriptionRepository.findBySubscriberIdAndDeletedFalse(id);
        LocalDateTime now = LocalDateTime.now();

        for (Subscription subscription : subscriptions) {
            subscription.setDeleted(true);
            subscription.setDeletedAt(now);
        }
        subscriptionRepository.saveAll(subscriptions);

        subscriber.setDeleted(true);
        subscriber.setDeletedAt(now);
        subscriberRepository.save(subscriber);
    }

    @Transactional
    public void purge(Long id, String adminPin) {
        adminPinService.validateOrThrow(adminPin);

        Subscriber subscriber = subscriberRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));

        List<Subscription> subscriptions = subscriptionRepository.findBySubscriberId(id);
        if (!subscriptions.isEmpty()) {
            subscriptionRepository.deleteAll(subscriptions);
        }

        subscriberRepository.delete(subscriber);
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
        for (int index = 0; index < length; index++) {
            result.append(random.nextInt(10));
        }
        return result.toString();
    }
}
