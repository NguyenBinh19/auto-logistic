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
public class DepartureListResponse {
    private String bookingCode;
    private String roomTitle;
    private String roomCode;
    private String guestName;
    private String agencyName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer totalRooms;
    private BigDecimal finalAmount;
    private String bookingStatus;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
