package com.HTPj.htpj.dto.request.rank;
import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRankRequest {
    private String rankCode;
    private String rankName;
    private String description;
    private String icon;
    private String color;
    private Integer priority;
    private Boolean isActive;

    private BigDecimal upgradeMinTotalRevenue;
    private BigDecimal maintainMinRevenue;

    private BigDecimal creditLimit;
}