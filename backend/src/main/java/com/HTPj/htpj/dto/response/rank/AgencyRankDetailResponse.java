package com.HTPj.htpj.dto.response.rank;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyRankDetailResponse {
    private Long agencyId;
    private String agencyName;
    private String address;
    private LocalDateTime createdAt;

    private Integer partnerVerificationId;

    private List<Long> bookingIds;
    private BigDecimal totalRevenue;

    private RankResponse currentRank;
    private RankResponse targetRank;

    private List<RankHistoryItem> histories;

    private String changeType;
}
