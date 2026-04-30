package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListAllBookingsResponse {
    private String bookingCode;
    private LocalDateTime createdAt;
    private String guestName;
    private String agencyName;
    private String hotelName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer totalRooms;
    private BigDecimal finalAmount;
    private String bookingStatus;
    private String paymentStatus;
}
