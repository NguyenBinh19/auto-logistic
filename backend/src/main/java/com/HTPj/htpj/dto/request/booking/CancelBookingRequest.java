package com.HTPj.htpj.dto.request.booking;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {
    private String bookingCode;
    private String reason;
}
