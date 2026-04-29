package com.campuspe.riskappetiteframework.mapper;

import com.campuspe.riskappetiteframework.dto.RiskDTO;
import com.campuspe.riskappetiteframework.entity.Risk;

public class RiskMapper {

    public static RiskDTO toDTO(Risk risk) {
        return RiskDTO.builder()
                .id(risk.getId())
                .title(risk.getTitle())
                .description(risk.getDescription())
                .category(risk.getCategory())
                .status(risk.getStatus())
                .riskScore(risk.getRiskScore())
                .owner(risk.getOwner())
                .aiDescription(risk.getAiDescription())
                .aiRecommendations(risk.getAiRecommendations())
                .aiProcessed(risk.getAiProcessed())
                .build();
    }

    public static Risk toEntity(RiskDTO dto) {
        return Risk.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .status(dto.getStatus())
                .riskScore(dto.getRiskScore())
                .owner(dto.getOwner())
                .build();
    }
}