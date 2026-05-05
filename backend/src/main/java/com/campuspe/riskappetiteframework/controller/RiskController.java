package com.campuspe.riskappetiteframework.controller;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
import com.campuspe.riskappetiteframework.dto.ApiResponse;
import com.campuspe.riskappetiteframework.service.RiskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Risk Management APIs", description = "APIs for managing risks")
@RestController
@RequestMapping("/api/risks")
public class RiskController {

    private final RiskService riskService;

    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    // GET /all paginated
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<RiskDTO>>> getAllRisks(Pageable pageable) {

        Page<RiskDTO> risks = riskService.getAllRisks(pageable);

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risks fetched successfully", risks)
        );
    }

    // GET /{id}
    @Operation(summary = "Get risk by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RiskDTO>> getRiskById(@PathVariable Long id) {

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risk fetched successfully",
                    riskService.getRiskById(id))
        );
    }
    
 // DELETE /{id}
    @Operation(summary = "Delete a risk by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRisk(@PathVariable Long id) {

        riskService.deleteRisk(id);

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risk deleted successfully", null)
        );
    }
    
    // POST /create
    @Operation(summary = "Create a new risk")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RiskDTO>> createRisk(
            @Valid @RequestBody RiskDTO dto) {

        RiskDTO saved = riskService.createRisk(dto);

        return new ResponseEntity<>(
            new ApiResponse<>(true, "Risk created successfully", saved),
            HttpStatus.CREATED
        );
    }
    
    @Operation(summary = "Update risk by ID")
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<RiskDTO>> updateRisk(
            @PathVariable Long id,
            @Valid @RequestBody RiskDTO dto) {

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risk updated successfully",
                    riskService.updateRisk(id, dto))
        );
    }
    
    @Operation(summary = "Get risks by category")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<RiskDTO>>> getByCategory(@PathVariable String category) {

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risks fetched by category",
                    riskService.getByCategory(category))
        );
    }
    
    @Operation(summary = "Get risks by status")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<RiskDTO>>> getByStatus(@PathVariable String status) {

        return ResponseEntity.ok(
            new ApiResponse<>(true, "Risks fetched by status",
                    riskService.getByStatus(status))
        );
    }
    @Operation(summary = "Search risks by keyword (title, category, status)")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<RiskDTO>>> searchRisks(
            @RequestParam String keyword,
            Pageable pageable) {

        Page<RiskDTO> result = riskService.searchRisks(keyword, pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Search results fetched", result)
        );
    }
}