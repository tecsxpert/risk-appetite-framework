package com.campuspe.riskappetiteframework.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
import com.campuspe.riskappetiteframework.entity.Risk;
import com.campuspe.riskappetiteframework.exception.ResourceNotFoundException;
import com.campuspe.riskappetiteframework.mapper.RiskMapper;
import com.campuspe.riskappetiteframework.repository.RiskRepository;

@Service
public class RiskService {

    private final RiskRepository riskRepository;
    private final AiServiceClient aiServiceClient;

    public RiskService(RiskRepository riskRepository, AiServiceClient aiServiceClient) {
        this.riskRepository = riskRepository;
        this.aiServiceClient = aiServiceClient;
    }

    // ─── GET ALL ──────────────────────────────────────────────────

    public Page<RiskDTO> getAllRisks(Pageable pageable) {
        return riskRepository.findAll(pageable)
                .map(RiskMapper::toDTO);
    }

    // ─── GET BY ID ────────────────────────────────────────────────

    public RiskDTO getRiskById(Long id) {
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found with id: " + id));
        return RiskMapper.toDTO(risk);
    }

    // ─── CREATE ───────────────────────────────────────────────────

    public RiskDTO createRisk(RiskDTO dto) {
        Risk risk = RiskMapper.toEntity(dto);
        Risk saved = riskRepository.save(risk);

        // Day 7: fire-and-forget AI enrichment after save
        enrichWithAI(saved.getId());

        return RiskMapper.toDTO(saved);
    }

    // ─── UPDATE ───────────────────────────────────────────────────

    public RiskDTO updateRisk(Long id, RiskDTO dto) {
        Risk existing = riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found with id: " + id));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setCategory(dto.getCategory());
        existing.setStatus(dto.getStatus());
        existing.setRiskScore(dto.getRiskScore());
        existing.setOwner(dto.getOwner());

        return RiskMapper.toDTO(riskRepository.save(existing));
    }

    // ─── AI ENRICHMENT (runs in background thread) ────────────────

    @Async("aiTaskExecutor")
    public void enrichWithAI(Long entityId) {
        try {
            Risk risk = riskRepository.findById(entityId).orElse(null);
            if (risk == null) {
                System.err.println("enrichWithAI: Risk not found for id " + entityId);
                return;
            }

            // Call /ai/describe
            String aiDescription = aiServiceClient.describe(
                    risk.getTitle(), risk.getDescription()
            );
            if (aiDescription != null) {
                risk.setAiDescription(aiDescription);
            }

            // Call /ai/recommend
            String aiRecommendations = aiServiceClient.recommend(
                    risk.getTitle(), risk.getDescription()
            );
            if (aiRecommendations != null) {
                risk.setAiRecommendations(aiRecommendations);
            }

            risk.setAiProcessed(true);
            riskRepository.save(risk);

            System.out.println("AI enrichment complete for risk id: " + entityId);

        } catch (Exception e) {
            // Never crash — entity is already saved safely
            System.err.println("AI enrichment failed for id " + entityId + ": " + e.getMessage());
        }
    }
}