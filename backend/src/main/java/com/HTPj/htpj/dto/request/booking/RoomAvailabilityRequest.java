package com.HTPj.htpj.dto.request.booking;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailabilityRequest {
    private Integer hotelId;
    private LocalDate checkIn;
    private LocalDate checkOut;
}
