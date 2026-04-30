package com.HTPj.htpj.dto.request.addonservice;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingAddonServiceRequest {

    private Long serviceId;
    private Integer quantity;
    private LocalDate serviceDate;
    private String flightNumber;
    private String flightTime;
    private String specialNote;
}
