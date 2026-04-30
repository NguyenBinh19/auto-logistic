package com.HTPj.htpj.dto.response.addonservice;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingAddonServiceResponse {

    private Long id;
    private Long bookingId;
    private Long serviceId;
    private String serviceName;
    private String category;
    private String unit;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDate serviceDate;
    private String flightNumber;
    private String flightTime;
    private String specialNote;
    private LocalDateTime createdAt;
}
