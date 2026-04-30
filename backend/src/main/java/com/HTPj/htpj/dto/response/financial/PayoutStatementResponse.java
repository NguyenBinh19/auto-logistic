package com.HTPj.htpj.dto.response.financial;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PayoutStatementResponse {
    private Long statementId;
    private String statementCode;
    private Integer hotelId;
    private String hotelName;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal grossRevenue;
    private BigDecimal totalCommission;
    private BigDecimal totalRefunds;
    private BigDecimal adjustments;
    private BigDecimal carriedForwardAmount;
    private BigDecimal netPayout;
    private Integer totalBookings;
    private Integer totalRoomNights;
    private String status;
    private String confirmedBy;
    private LocalDateTime confirmedAt;
    //    private String disputeReason;
//    private String disputeReasonCode;
    //bank
    private String bankName;
    private String bankAccountHolder;
    private String bankAccountNumber;

    private String bankReference;
    private String paidBy;
    private String paymentProofUrl;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private List<PayoutLineItemResponse> lineItems;
}
