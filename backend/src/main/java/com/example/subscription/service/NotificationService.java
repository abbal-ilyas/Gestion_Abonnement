package com.example.subscription.service;

import com.example.subscription.dto.NotificationResponse;
import com.example.subscription.model.Subscription;
import com.example.subscription.model.SubscriptionStatus;
import com.example.subscription.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final long RENEWAL_REQUIRED_THRESHOLD_DAYS = 7;

    private final SubscriptionRepository subscriptionRepository;

    public List<NotificationResponse> daily(LocalDate referenceDate) {
        LocalDate start = referenceDate.minusDays(2);
        LocalDate end = referenceDate.plusDays(14);
        List<Subscription> candidates = subscriptionRepository.findEndingBetween(start, end);

        return candidates.stream()
                .map(sub -> {
                    long daysUntilEnd = ChronoUnit.DAYS.between(referenceDate, sub.getEndDate());
                    SubscriptionStatus status = daysUntilEnd < 0
                        ? SubscriptionStatus.EXPIRED
                        : daysUntilEnd <= RENEWAL_REQUIRED_THRESHOLD_DAYS
                            ? SubscriptionStatus.RENEWAL_REQUIRED
                            : SubscriptionStatus.ACTIVE;
                    return new NotificationResponse(
                            sub.getId(),
                            sub.getSubscriber() != null ? sub.getSubscriber().getId() : null,
                            sub.getSubscriber() != null
                                    ? sub.getSubscriber().getFirstName() + " " + sub.getSubscriber().getLastName()
                                    : "Unknown",
                            sub.getEndDate(),
                            daysUntilEnd,
                            status);
                })
                .sorted(Comparator.comparing(NotificationResponse::endDate))
                .collect(Collectors.toList());
    }
}
