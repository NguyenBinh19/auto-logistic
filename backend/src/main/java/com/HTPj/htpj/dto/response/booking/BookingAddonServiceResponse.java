package com.HTPj.htpj.dto.response.booking;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingAddonServiceResponse {
    private Long id;
    private String serviceName;
    private String serviceType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDate serviceDate;
    private String flightNumber;
    private String flightTime;
    private String specialNote;
}
