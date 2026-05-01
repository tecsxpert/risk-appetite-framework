package com.campuspe.riskappetiteframework.controller;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
import com.campuspe.riskappetiteframework.service.RiskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public ResponseEntity<Void> deleteRisk(@PathVariable Long id) {

        riskService.deleteRisk(id);

        return ResponseEntity.noContent().build(); // 204
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
    
    @PutMapping("/update/{id}")
    public ResponseEntity<RiskDTO> updateRisk(
            @PathVariable Long id,
            @Valid @RequestBody RiskDTO dto) {

        RiskDTO updated = riskService.updateRisk(id, dto);

        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<RiskDTO>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(
                riskService.getByCategory(category)
        );
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RiskDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(
                riskService.getByStatus(status)
        );
    }
}