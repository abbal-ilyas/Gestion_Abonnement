package com.example.subscription.controller;

import com.example.subscription.dto.SubscriptionRequest;
import com.example.subscription.model.Subscription;
import com.example.subscription.model.SubscriptionStatus;
import com.example.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<Subscription> create(@Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> update(@PathVariable Long id, @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(subscriptionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/purge")
    public ResponseEntity<Void> purge(@PathVariable Long id, @RequestHeader("X-Admin-Pin") String adminPin) {
        subscriptionService.purge(id, adminPin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) Long subscriberId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(subscriptionService.listFiltered(startDate, endDate, status, subscriberId, search));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Subscription>> history(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) String deletedTarget) {
        return ResponseEntity.ok(subscriptionService.history(year, month, date, search, status, amount, deletedTarget));
    }
}
