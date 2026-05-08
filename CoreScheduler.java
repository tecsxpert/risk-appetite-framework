package com.example.demo.scheduler;

import com.example.demo.entity.CoreEntity;
import com.example.demo.repository.CoreEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CoreScheduler {

    private final CoreEntityRepository repository;

    // ⏰ 1. DAILY OVERDUE CHECK (Every day 9 AM)
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendOverdueReminders() {

        List<CoreEntity> overdue = repository.findOverdue(LocalDateTime.now());

        log.info("Overdue items count: {}", overdue.size());

        overdue.forEach(item ->
                log.info("Overdue: {} | Email: {}", item.getName(), item.getEmail())
        );

        // 👉 Replace with Email/SMS later
    }

    // ⏰ 2. 7-DAY ADVANCE ALERT (Every day 10 AM)
    @Scheduled(cron = "0 0 10 * * ?")
    public void upcomingDeadlineAlert() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next7Days = now.plusDays(7);

        List<CoreEntity> upcoming = repository.findUpcoming(now, next7Days);

        log.info("Upcoming deadlines (7 days): {}", upcoming.size());

        upcoming.forEach(item ->
                log.info("Upcoming: {} | Deadline: {}", item.getName(), item.getDeadline())
        );
    }

    // ⏰ 3. WEEKLY SUMMARY (Every Monday 8 AM)
    @Scheduled(cron = "0 0 8 ? * MON")
    public void weeklySummary() {

        long total = repository.count();
        long active = repository.countByStatus("ACTIVE");
        long deleted = repository.countByIsDeletedTrue();

        log.info("Weekly Summary:");
        log.info("Total: {}", total);
        log.info("Active: {}", active);
        log.info("Deleted: {}", deleted);

        // 👉 Replace with email report later
    }
}