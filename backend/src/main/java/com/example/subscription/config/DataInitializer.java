package com.example.subscription.config;

import com.example.subscription.model.AppUser;
import com.example.subscription.model.Subscriber;
import com.example.subscription.model.Subscription;
import com.example.subscription.model.SubscriptionStatus;
import com.example.subscription.repository.SubscriberRepository;
import com.example.subscription.repository.SubscriptionRepository;
import com.example.subscription.service.UserService;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserService userService;
    private final SubscriberRepository subscriberRepository;
    private final SubscriptionRepository subscriptionRepository;

    @PostConstruct
    @Transactional
    public void seed() {
        if (subscriptionRepository.count() > 0) {
            return;
        }

        if (!userServiceExists("admin")) {
            userService.save("admin", "admin123", AppUser.Role.ADMIN);
        }

        Subscriber alice = subscriberRepository.save(buildSubscriber("Alice", "Martin", "alice@example.com", "+33 6 00 00 00 00"));
        Subscriber bob = subscriberRepository.save(buildSubscriber("Bob", "Dupont", "bob@example.com", "+33 6 11 22 33 44"));
        Subscriber chloe = subscriberRepository.save(buildSubscriber("Chloe", "Ben Youssef", "chloe@example.com", "+971 50 123 4567"));

        subscriptionRepository.saveAll(List.of(
                buildSubscription(alice, LocalDate.now().minusMonths(1), LocalDate.now().plusDays(5), new BigDecimal("49.90"), SubscriptionStatus.RENEWAL_REQUIRED),
                buildSubscription(alice, LocalDate.now().minusMonths(6), LocalDate.now().minusDays(2), new BigDecimal("29.00"), SubscriptionStatus.EXPIRED),
                buildSubscription(bob, LocalDate.now(), LocalDate.now().plusMonths(3), new BigDecimal("99.00"), SubscriptionStatus.ACTIVE),
                buildSubscription(chloe, LocalDate.now().minusWeeks(2), LocalDate.now().plusDays(1), new BigDecimal("59.00"), SubscriptionStatus.RENEWAL_REQUIRED)));
    }

    private boolean userServiceExists(String username) {
        try {
            userService.loadUserByUsername(username);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Subscriber buildSubscriber(String firstName, String lastName, String email, String phone) {
        Subscriber subscriber = new Subscriber();
        subscriber.setFirstName(firstName);
        subscriber.setLastName(lastName);
        subscriber.setEmail(email);
        subscriber.setPhone(phone);
        return subscriber;
    }

    private Subscription buildSubscription(Subscriber subscriber, LocalDate start, LocalDate end, BigDecimal amount, SubscriptionStatus status) {
        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setStartDate(start);
        subscription.setEndDate(end);
        subscription.setAmount(amount);
        subscription.setStatus(status);
        return subscription;
    }
}
