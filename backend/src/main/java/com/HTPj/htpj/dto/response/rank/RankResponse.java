package com.HTPj.htpj.dto.response.rank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankResponse {

    private Integer id;
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

    private Long agencies;
    private LocalDateTime updatedAt;
    private String updatedBy;
}