package com.example.demo.aop;

import com.example.demo.entity.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.*;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 🎯 Intercept all Service methods
    @Around("execution(* com.example.demo.service.impl.*.*(..))")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {

        String methodName = joinPoint.getSignature().getName();

        // 🎯 Only track CUD operations
        if (!(methodName.startsWith("create") ||
                methodName.startsWith("update") ||
                methodName.startsWith("delete"))) {

            return joinPoint.proceed();
        }

        Object[] args = joinPoint.getArgs();

        String oldValue = null;
        String newValue = null;
        Long entityId = null;

        // 👉 Capture OLD value (for update/delete)
        if (methodName.startsWith("update") || methodName.startsWith("delete")) {
            entityId = (Long) args[0];

            // ⚠️ You can enhance this by calling repository to fetch old data
        }

        Object result = joinPoint.proceed(); // actual method call

        // 👉 Capture NEW value
        if (result != null) {
            newValue = objectMapper.writeValueAsString(result);
        }

        // 👉 Build audit log
        AuditLog log = AuditLog.builder()
                .entityName(joinPoint.getTarget().getClass().getSimpleName())
                .entityId(entityId)
                .action(methodName.toUpperCase())
                .oldValue(oldValue)
                .newValue(newValue)
                .createdAt(LocalDateTime.now())
                .build();

        auditRepo.save(log);

        return result;
    }
}