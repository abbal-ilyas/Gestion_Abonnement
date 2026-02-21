package com.example.subscription.service;

import com.example.subscription.dto.SubscriptionRequest;
import com.example.subscription.model.Subscriber;
import com.example.subscription.model.Subscription;
import com.example.subscription.model.SubscriptionStatus;
import com.example.subscription.repository.SubscriberRepository;
import com.example.subscription.repository.SubscriptionRepository;
import java.util.Comparator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final long RENEWAL_REQUIRED_THRESHOLD_DAYS = 7;

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriberRepository subscriberRepository;
    private final AdminPinService adminPinService;

    @Transactional
    public Subscription create(SubscriptionRequest request) {
        Subscriber subscriber = subscriberRepository
                .findByIdAndDeletedFalse(request.subscriberId())
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));

        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setAmount(request.amount());
        subscription.setStartDate(request.startDate());
        subscription.setEndDate(request.endDate());
        subscription.setStatus(resolveStatus(request.endDate(), LocalDate.now()));
        return subscriptionRepository.save(subscription);
    }

    public List<Subscription> listFiltered(LocalDate startDate, LocalDate endDate, SubscriptionStatus status, Long subscriberId, String search) {
        List<Subscription> all = subscriptionRepository.findAllByDeletedFalseAndSubscriberDeletedFalse();

        return all.stream()
            .peek(this::applyResolvedStatus)
                .filter(s -> startDate == null || !s.getStartDate().isBefore(startDate))
                .filter(s -> endDate == null || !s.getEndDate().isAfter(endDate))
                .filter(s -> status == null || s.getStatus() == status)
                .filter(s -> subscriberId == null || (s.getSubscriber() != null && subscriberId.equals(s.getSubscriber().getId())))
                .filter(s -> {
                    if (search == null || search.isBlank() || s.getSubscriber() == null) {
                        return true;
                    }
                    String q = search.toLowerCase();
                    String candidate = (s.getSubscriber().getFirstName() + " "
                            + s.getSubscriber().getLastName() + " "
                            + s.getSubscriber().getEmail() + " "
                            + (s.getSubscriber().getCode() == null ? "" : s.getSubscriber().getCode()))
                            .toLowerCase();
                    return candidate.contains(q);
                })
                .collect(Collectors.toList());
    }

    public List<Subscription> findEndingBetween(LocalDate from, LocalDate to) {
        return subscriptionRepository.findEndingBetween(from, to);
    }

    @Transactional
    public Subscription update(Long id, SubscriptionRequest request) {
        Subscription subscription = subscriptionRepository
            .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));

        Subscriber subscriber = subscriberRepository
            .findByIdAndDeletedFalse(request.subscriberId())
                .orElseThrow(() -> new IllegalArgumentException("Subscriber not found"));

        subscription.setSubscriber(subscriber);
        subscription.setAmount(request.amount());
        subscription.setStartDate(request.startDate());
        subscription.setEndDate(request.endDate());
        subscription.setStatus(resolveStatus(request.endDate(), LocalDate.now()));
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void delete(Long id) {
        Subscription subscription = subscriptionRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        subscription.setDeleted(true);
        subscription.setDeletedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void purge(Long id, String adminPin) {
        adminPinService.validateOrThrow(adminPin);

        Subscription subscription = subscriptionRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        subscriptionRepository.delete(subscription);
    }

    public List<Subscription> history(
            Integer year,
            Integer month,
            LocalDate exactDate,
            String search,
            SubscriptionStatus status,
            BigDecimal amount,
            String deletedTarget) {
        String normalizedDeletedTarget = deletedTarget == null ? "" : deletedTarget.trim().toUpperCase();
        List<Subscription> source = normalizedDeletedTarget.isBlank()
            ? subscriptionRepository.findAllByDeletedFalseAndSubscriberDeletedFalse()
            : subscriptionRepository.findAll();

        return source.stream()
            .peek(this::applyResolvedStatus)
                .filter(s -> {
                    LocalDate date = s.getStartDate();
                    if (date == null) return false;

                    if (exactDate != null) {
                        return date.equals(exactDate);
                    }

                    if (year != null && date.getYear() != year) {
                        return false;
                    }

                    if (month != null && date.getMonthValue() != month) {
                        return false;
                    }

                    return true;
                })
                .filter(s -> {
                    if (search == null || search.isBlank() || s.getSubscriber() == null) {
                        return true;
                    }
                    String q = search.toLowerCase();
                    String candidate = (s.getSubscriber().getFirstName() + " "
                            + s.getSubscriber().getLastName() + " "
                            + s.getSubscriber().getEmail() + " "
                            + (s.getSubscriber().getCode() == null ? "" : s.getSubscriber().getCode()))
                            .toLowerCase();
                    return candidate.contains(q);
                })
                .filter(s -> status == null || s.getStatus() == status)
                .filter(s -> amount == null || (s.getAmount() != null && s.getAmount().compareTo(amount) == 0))
                .filter(s -> matchesDeletedTarget(s, normalizedDeletedTarget))
                .sorted(Comparator.comparing(Subscription::getStartDate).reversed())
                .collect(Collectors.toList());
    }

    private boolean matchesDeletedTarget(Subscription subscription, String deletedTarget) {
        String value = deletedTarget == null ? "" : deletedTarget.trim().toUpperCase();
        boolean subscriptionDeleted = Boolean.TRUE.equals(subscription.getDeleted());
        boolean subscriberDeleted = subscription.getSubscriber() != null && Boolean.TRUE.equals(subscription.getSubscriber().getDeleted());

        return switch (value) {
            case "SUBSCRIPTION" -> subscriptionDeleted;
            case "SUBSCRIBER" -> subscriberDeleted;
            case "ANY" -> subscriptionDeleted || subscriberDeleted;
            default -> !subscriptionDeleted && !subscriberDeleted;
        };
    }

    private void applyResolvedStatus(Subscription subscription) {
        subscription.setStatus(resolveStatus(subscription.getEndDate(), LocalDate.now()));
    }

    private SubscriptionStatus resolveStatus(LocalDate endDate, LocalDate referenceDate) {
        if (endDate == null) {
            return SubscriptionStatus.ACTIVE;
        }

        long daysUntilEnd = ChronoUnit.DAYS.between(referenceDate, endDate);
        if (daysUntilEnd < 0) {
            return SubscriptionStatus.EXPIRED;
        }

        if (daysUntilEnd <= RENEWAL_REQUIRED_THRESHOLD_DAYS) {
            return SubscriptionStatus.RENEWAL_REQUIRED;
        }

        return SubscriptionStatus.ACTIVE;
    }
}
