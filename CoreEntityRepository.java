package com.example.flywaydemo.repository;

import com.example.flywaydemo.entity.CoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CoreEntityRepository extends JpaRepository<CoreEntity, Long> {

    // 🔍 Search by name or email (case-insensitive)
    @Query("SELECT c FROM CoreEntity.java c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CoreEntity> search(@Param("keyword") String keyword);


    // 📌 Filter by status
    List<CoreEntity> findByStatus(String status);


    // 📅 Find by date range (createdAt)
    @Query("SELECT c FROM CoreEntity.java c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<CoreEntity> findByCreatedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}