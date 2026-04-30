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
public class BookingHistoryResponse {
    private Long bookingId;
    private String bookingCode;
    private Integer hotelId;
    private String hotelName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer nights;
    private Integer totalRooms;
    private Integer totalGuests;
    private BigDecimal finalAmount;
    private String bookingStatus;
    private String paymentStatus;
    private String guestName;
    private LocalDateTime createdAt;
    // Summary of room types for display (e.g. "2x Deluxe King, 1x Suite")
    private String roomSummary;
}
