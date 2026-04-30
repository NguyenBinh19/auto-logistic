package com.HTPj.htpj.dto.response.commision;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionResponse {
    private Long commissionId;
    private String commissionType;
    private String rateType;
    private BigDecimal commissionValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
}
