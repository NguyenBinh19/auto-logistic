package com.HTPj.htpj.dto.request.promotions;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePromotionRequest {
    private String code;
    private String name;
    private String typePromotion;
    private String typeDiscount;
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
    private String createdBy;
}