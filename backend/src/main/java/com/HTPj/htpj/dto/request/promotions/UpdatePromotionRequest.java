package com.HTPj.htpj.dto.request.promotions;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePromotionRequest {
    private String name;
    private String code;
    private BigDecimal discountVal;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderVal;
    private LocalDate applyStartDate;
    private LocalDate applyEndDate;
    private Integer agencyUsageLimit;
    private LocalDate stayStartDate;
    private LocalDate stayEndDate;
    private Integer minStay;
    private Integer maxUsage;
    private String status;
}