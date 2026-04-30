package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoShowResponse {
    private String bookingCode;
    private String bookingStatus;
    private BigDecimal penaltyAmount;
    private String reason;
    private LocalDateTime reportedAt;
}
