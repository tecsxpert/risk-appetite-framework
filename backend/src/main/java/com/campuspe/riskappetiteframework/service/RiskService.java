package com.campuspe.riskappetiteframework.service;

import com.campuspe.riskappetiteframework.entity.Risk;
import com.campuspe.riskappetiteframework.exception.ResourceNotFoundException;
import com.campuspe.riskappetiteframework.repository.RiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class RiskService {

    private final RiskRepository riskRepository;

    public RiskService(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    // CREATE
    public Risk createRisk(Risk risk) {
        validateRisk(risk);
        return riskRepository.save(risk);
    }

    // GET ALL (Paginated)
    public Page<Risk> getAllRisks(Pageable pageable) {
        return riskRepository.findAll(pageable);
    }

    // GET BY ID
    public Risk getRiskById(Long id) {
        return riskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Risk not found with id: " + id));
    }

    // UPDATE
    public Risk updateRisk(Long id, Risk updatedRisk) {
        Risk existing = getRiskById(id);

        existing.setTitle(updatedRisk.getTitle());
        existing.setDescription(updatedRisk.getDescription());
        existing.setCategory(updatedRisk.getCategory());
        existing.setStatus(updatedRisk.getStatus());
        existing.setRiskScore(updatedRisk.getRiskScore());
        existing.setOwner(updatedRisk.getOwner());

        return riskRepository.save(existing);
    }

    // DELETE
    public void deleteRisk(Long id) {
        Risk existing = getRiskById(id);
        riskRepository.delete(existing);
    }

    // VALIDATION
    private void validateRisk(Risk risk) {
        if (risk.getTitle() == null || risk.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (risk.getRiskScore() == null || risk.getRiskScore() < 0) {
            throw new IllegalArgumentException("Risk score must be positive");
        }
    }
}