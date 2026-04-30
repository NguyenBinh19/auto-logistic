package com.HTPj.htpj.dto.response.promotions;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponse {
    private Integer id;
    private Integer hotelId;
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
    private Integer usedCount;
    private String status;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private String createdBy;
}