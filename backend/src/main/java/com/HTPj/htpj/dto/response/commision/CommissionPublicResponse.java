package com.HTPj.htpj.dto.response.commision;

import java.math.BigDecimal;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionPublicResponse {
    private String rateType;
    private BigDecimal commissionValue;
}
