package com.example.subscription.dto;

import com.example.subscription.model.SubscriptionStatus;
import java.time.LocalDate;

public record NotificationResponse(
        Long subscriptionId,
        Long subscriberId,
        String subscriberName,
        LocalDate endDate,
        long daysUntilEnd,
        SubscriptionStatus status) {
}
