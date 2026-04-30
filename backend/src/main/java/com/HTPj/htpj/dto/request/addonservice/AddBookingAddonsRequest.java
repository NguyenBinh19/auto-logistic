package com.HTPj.htpj.dto.request.addonservice;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddBookingAddonsRequest {

    private Long bookingId;
    private List<BookingAddonServiceRequest> services;
}
