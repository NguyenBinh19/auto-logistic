package com.HTPj.htpj.dto.request.pricingrule;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPricingRuleRequest {

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
}

