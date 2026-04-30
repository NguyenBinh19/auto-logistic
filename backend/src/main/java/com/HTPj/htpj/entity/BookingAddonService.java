package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_addon_services")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingAddonService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private AddonService addonService;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "service_date")
    private LocalDate serviceDate;

    @Column(name = "flight_number", length = 20)
    private String flightNumber;

    @Column(name = "flight_time", length = 10)
    private String flightTime;

    @Column(name = "special_note", columnDefinition = "NVARCHAR(MAX)")
    private String specialNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
