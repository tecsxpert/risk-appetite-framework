package com.campuspe.riskappetiteframework.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Risk score is required")
    private Integer riskScore;

    @NotBlank(message = "Owner is required")
    private String owner;
}