package com.campuspe.riskappetiteframework.service;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
import com.campuspe.riskappetiteframework.mapper.RiskMapper;
import com.campuspe.riskappetiteframework.entity.Risk;
import com.campuspe.riskappetiteframework.exception.ResourceNotFoundException;
import com.campuspe.riskappetiteframework.repository.RiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class RiskService {

    private final RiskRepository riskRepository;

    public RiskService(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    // CREATE
    public RiskDTO createRisk(RiskDTO dto) {
    Risk risk = RiskMapper.toEntity(dto);
    validateRisk(risk);

    Risk savedRisk = riskRepository.save(risk);

    return RiskMapper.toDTO(savedRisk);
    }

    // GET ALL (Paginated)
    public Page<RiskDTO> getAllRisks(Pageable pageable) {
    return riskRepository.findAll(pageable)
            .map(RiskMapper::toDTO);
    }

    // GET BY ID
    public RiskDTO getRiskById(Long id) {
    Risk risk = riskRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Risk not found with id: " + id));

    return RiskMapper.toDTO(risk);
    }
    
    // UPDATE
    public RiskDTO updateRisk(Long id, RiskDTO dto) {

        Risk existing = riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found"));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setCategory(dto.getCategory());
        existing.setStatus(dto.getStatus());
        existing.setRiskScore(dto.getRiskScore());
        existing.setOwner(dto.getOwner());

        Risk updated = riskRepository.save(existing);

        return RiskMapper.toDTO(updated);
    }
    
    // DELETE 
    public void deleteRisk(Long id) {
        Risk existing = riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found"));

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
    
    public List<RiskDTO> getByStatus(String status) {
        return riskRepository.findByStatus(status)
                .stream()
                .map(RiskMapper::toDTO)
                .toList();
    }
    
    
    public List<RiskDTO> getByCategory(String category) {
        return riskRepository.findByCategory(category)
                .stream()
                .map(RiskMapper::toDTO)
                .toList();
    }
}