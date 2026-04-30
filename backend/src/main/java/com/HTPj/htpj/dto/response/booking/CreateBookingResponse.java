package com.HTPj.htpj.dto.response.booking;
import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingResponse {
    private Long bookingId;
    private String bookingCode;
    private BigDecimal finalAmount;
    private String bookingStatus;
    private String paymentStatus;
}
