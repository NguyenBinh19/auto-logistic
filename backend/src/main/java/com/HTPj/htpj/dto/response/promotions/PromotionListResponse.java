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
public class PromotionListResponse {
    private Integer id;
    private String code;
    private String name;
    private String typePromotion;
    private String typeDiscount;
    private BigDecimal discountVal;
    private LocalDate applyStartDate;
    private LocalDate applyEndDate;
    private Integer usedCount;
    private Integer maxUsage;
    private String status;
}