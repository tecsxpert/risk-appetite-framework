package com.campuspe.riskappetiteframework.controller;

import com.campuspe.riskappetiteframework.entity.Risk;
import com.campuspe.riskappetiteframework.service.RiskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risks")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    // GET /all paginated
    @GetMapping("/all")
    public ResponseEntity<Page<Risk>> getAllRisks(Pageable pageable) {
        return ResponseEntity.ok(riskService.getAllRisks(pageable));
    }

    // GET /{id} with 404
    @GetMapping("/{id}")
    public ResponseEntity<Risk> getRiskById(@PathVariable Long id) {
        return ResponseEntity.ok(riskService.getRiskById(id));
    }

    // POST /create with @Valid
    @PostMapping("/create")
    public ResponseEntity<Risk> createRisk(@Valid @RequestBody Risk risk) {
        Risk savedRisk = riskService.createRisk(risk);
        return new ResponseEntity<>(savedRisk, HttpStatus.CREATED);
    }
}