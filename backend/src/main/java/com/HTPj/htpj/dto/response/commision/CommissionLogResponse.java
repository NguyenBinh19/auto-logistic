package com.HTPj.htpj.dto.response.commision;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionLogResponse {

    private Long id;

    private Long hotelId;
    private String oldRateType;
    private String newRateType;

    private Long oldCommissionId;
    private BigDecimal oldValue;
    private String oldCommissionType;

    private Long newCommissionId;
    private BigDecimal newValue;
    private String newCommissionType;

    private String changedBy;
    private LocalDateTime changedAt;
    private String note;
}