package com.example.subscription.controller;

import com.example.subscription.dto.SubscriberRequest;
import com.example.subscription.model.Subscriber;
import com.example.subscription.service.SubscriberService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/subscribers")
@RequiredArgsConstructor
@CrossOrigin
public class SubscriberController {

    private final SubscriberService subscriberService;

    @PostMapping
    public ResponseEntity<Subscriber> create(@Valid @RequestBody SubscriberRequest request) {
        return ResponseEntity.ok(subscriberService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscriber> update(@PathVariable Long id, @Valid @RequestBody SubscriberRequest request) {
        return ResponseEntity.ok(subscriberService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subscriberService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/purge")
    public ResponseEntity<Void> purge(@PathVariable Long id, @RequestHeader("X-Admin-Pin") String adminPin) {
        subscriberService.purge(id, adminPin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Subscriber>> list(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(subscriberService.list(search));
    }
}
