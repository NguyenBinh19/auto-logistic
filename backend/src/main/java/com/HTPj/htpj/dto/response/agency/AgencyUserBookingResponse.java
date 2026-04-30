package com.HTPj.htpj.dto.response.agency;

import java.math.BigDecimal;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyUserBookingResponse {
    private String userId;
    private String username;
    private String fullName;

    private Integer totalBooking;
    private BigDecimal totalMoneyUsage;

    private List<BookingItemResponse> bookings;
}
