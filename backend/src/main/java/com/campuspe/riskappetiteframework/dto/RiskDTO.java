package com.campuspe.riskappetiteframework.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Risk score is required")
    @Min(value = 0, message = "Risk score must be >= 0")
    private Integer riskScore;

    @NotBlank(message = "Owner is required")
    private String owner;
}