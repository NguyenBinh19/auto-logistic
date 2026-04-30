package com.HTPj.htpj.dto.response.rank;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankHistoryItem {
    private Long id;
    private String oldRank;
    private String newRank;
    private BigDecimal totalRevenue;
    private String changeType;
    private String reason;
    private LocalDateTime changedAt;
}
