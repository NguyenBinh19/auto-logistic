package com.HTPj.htpj.dto.response.pricingrule;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPricingRuleResponse {

    private Integer ruleId;
    private Integer roomTypeId;
    private String ruleName;
    private String ruleType;
    private String dayOfWeek;
    private LocalDate startDate;
    private LocalDate endDate;
    private String action;
    private String adjustmentType;
    private BigDecimal adjustmentValue;
    private Integer priority;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}