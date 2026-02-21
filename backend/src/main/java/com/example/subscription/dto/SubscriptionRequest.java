package com.example.subscription.dto;

import com.example.subscription.model.SubscriptionStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @Min(0) BigDecimal amount,
        @NotNull Long subscriberId,
        SubscriptionStatus status) {
}
