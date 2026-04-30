package com.campuspe.riskappetiteframework.controller;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
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
    public ResponseEntity<Page<RiskDTO>> getAllRisks(Pageable pageable) {
        return ResponseEntity.ok(
                riskService.getAllRisks(pageable)
        );
    }

    // GET /{id}
    @GetMapping("/{id}")
    public ResponseEntity<RiskDTO> getRiskById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                riskService.getRiskById(id)
        );
    }
    
 // DELETE /{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRisk(@PathVariable Long id) {

        riskService.deleteRisk(id);

        return ResponseEntity.ok("Risk deleted successfully");
    }

    // POST /create
    @PostMapping("/create")
    public ResponseEntity<RiskDTO> createRisk(
            @Valid @RequestBody RiskDTO dto) {

        RiskDTO savedRisk =
                riskService.createRisk(dto);

        return new ResponseEntity<>(
                savedRisk,
                HttpStatus.CREATED
        );
    }
}