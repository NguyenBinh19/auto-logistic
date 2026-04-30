package com.HTPj.htpj.dto.response.agency;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItemResponse {
    private Long bookingId;
    private String bookingStatus;
    private BigDecimal paymentAmount;
}
