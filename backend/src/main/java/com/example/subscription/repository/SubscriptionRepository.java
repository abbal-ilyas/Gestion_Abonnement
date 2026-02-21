package com.example.subscription.repository;

import com.example.subscription.model.Subscription;
import com.example.subscription.model.SubscriptionStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    @Query("SELECT s FROM Subscription s WHERE s.deleted = false AND s.subscriber.deleted = false AND s.endDate BETWEEN :startDate AND :endDate")
    List<Subscription> findEndingBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<Subscription> findBySubscriberIdAndDeletedFalse(Long subscriberId);

    List<Subscription> findBySubscriberId(Long subscriberId);

    List<Subscription> findByStatusAndDeletedFalse(SubscriptionStatus status);

    List<Subscription> findAllByDeletedFalseAndSubscriberDeletedFalse();

    java.util.Optional<Subscription> findByIdAndDeletedFalse(Long id);
}
