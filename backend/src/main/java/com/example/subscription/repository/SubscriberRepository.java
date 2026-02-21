package com.example.subscription.repository;

import com.example.subscription.model.Subscriber;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    boolean existsByEmailAndDeletedFalse(String email);
    boolean existsByEmailAndIdNotAndDeletedFalse(String email, Long id);
    boolean existsByCode(String code);

    List<Subscriber> findAllByDeletedFalse();

    java.util.Optional<Subscriber> findByIdAndDeletedFalse(Long id);

    @Query("SELECT s FROM Subscriber s WHERE s.deleted = false AND LOWER(CONCAT(s.firstName, ' ', s.lastName, ' ', s.email, ' ', COALESCE(s.code, ''))) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Subscriber> search(@Param("search") String search);
}
