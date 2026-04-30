package com.HTPj.htpj.dto.response.rank;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RankHistoryResponse {

    Long id;

    Long agencyId;
    String agencyName;

    String oldRank;
    String newRank;

    BigDecimal totalRevenue;

    String changeType;
    String reason;

    LocalDateTime changedAt;
    String changedBy; // username
}