package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDetailItemResponse {
    private Long bookingDetailId;
    private String roomTitle;
    private Integer quantity;
    private String roomCode;
    private String bedType;
    private BigDecimal roomArea;
    private Integer maxAdults;
    private Integer maxChildren;
    private Integer maxGuests;
    private String amenities;
    private BigDecimal pricePerNight;
    private BigDecimal subtotalAmount;
    private BigDecimal totalAmount;
    private Integer nights;
}
