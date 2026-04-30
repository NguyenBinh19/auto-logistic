package com.HTPj.htpj.dto.response.financial;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PayoutLineItemResponse {
    private Long lineItemId;
    private Long bookingId;
    private String bookingCode;
    private String agencyName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer roomNights;
    private BigDecimal grossAmount;
    private BigDecimal commissionAmount;
    private BigDecimal refundAmount;
    private BigDecimal netAmount;
}
