package com.HTPj.htpj.dto.response.rank;
import java.math.BigDecimal;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankPublicResponse {
    private String rankName;
    private BigDecimal maintainMinRevenue;
    private BigDecimal upgradeMinTotalRevenue;
    private BigDecimal creditLimit;
}
