package com.HTPj.htpj.dto.request.rank;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeRankRequest {
    private Long agencyId;
    private Integer currentRankId;
    private Integer targetRankId;
    private BigDecimal totalRevenue;
    private String changeType;
    private String reason;
    private String status;
}
