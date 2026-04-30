package com.HTPj.htpj.dto.response.financial;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PayoutListItemResponse {
    private Long statementId;
    private String statementCode;
    private Integer hotelId;
    private String hotelName;
    private String hotelBankName;
    private String hotelBankAccountLast4;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal grossRevenue;
    private BigDecimal totalCommission;
    private BigDecimal netPayout;
    private Integer totalBookings;
    private BigDecimal carriedForwardAmount;
    private String status;
    private Boolean missingBankInfo;
    private LocalDateTime confirmedAt;
    private LocalDateTime paidAt;
}
