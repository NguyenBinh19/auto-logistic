package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingResponse {
    private String bookingCode;
    private String bookingStatus;
    private BigDecimal cancellationPenalty;
    private BigDecimal finalAmount;
    private BigDecimal refundAmount;
    private String reason;
    private LocalDateTime cancelledAt;
}
