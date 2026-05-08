package com.example.demo.controller;

import com.example.demo.entity.CoreEntity;
import com.example.demo.repository.CoreEntityRepository;
import com.example.demo.service.CoreEntityService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/core")
public class CoreEntityController {

    private final CoreEntityService service;

    public CoreEntityController(CoreEntityService service) {
        this.service = service;
    }
//
//    @PutMapping("/{id}")
//    public CoreEntity update(@PathVariable Long id, @RequestBody CoreEntity updated) {
//        return service.update(id, updated);
//    }
//
//    @DeleteMapping("/{id}")
//    public String softDelete(@PathVariable Long id) {
//        return service.softDelete(id);
//    }
//
//    @GetMapping("/search")
//    public List<CoreEntity> search(@RequestParam String q) {
//        return service.search(q);
//    }
//
//    @GetMapping("/stats")
//    public Map<String, Object> stats() {
//        return service.getStats();
//    }


    // 👀 VIEW → all roles
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','VIEWER')")
    public List<CoreEntity> search(@RequestParam String q) {
        return service.search(q);
    }

    // ✏️ UPDATE → ADMIN + MANAGER
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public CoreEntity update(@PathVariable Long id, @RequestBody CoreEntity updated) {
        return service.update(id, updated);
    }

    // ❌ DELETE → ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        return service.softDelete(id);
    }

    // 📊 STATS → ADMIN only
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> stats() {
        return service.getStats();
    }

}