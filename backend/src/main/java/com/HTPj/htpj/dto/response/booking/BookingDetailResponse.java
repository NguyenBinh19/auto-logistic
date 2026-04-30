package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDetailResponse {
    private Long bookingId;
    private String bookingCode;
    private Integer hotelId;
    private String hotelName;
    private String hotelAddress;
    private Integer hotelStarRating;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer nights;
    private Integer totalRooms;
    private Integer totalGuests;

    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private String notes;

    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String bookingStatus;

    private LocalDateTime createdAt;
    private Boolean hasFeedback;

    private List<BookingDetailItemResponse> roomDetails;
    private List<BookingAddonServiceResponse> addonServices;
}
