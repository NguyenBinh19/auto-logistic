package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payout_line_items")
public class PayoutLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "line_item_id")
    private Long lineItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "statement_id", nullable = false)
    private PayoutStatement payoutStatement;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "booking_code", nullable = false, length = 50)
    private String bookingCode;

    @Column(name = "agency_name", length = 255)
    private String agencyName;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "room_nights")
    private Integer roomNights;

    @Column(name = "gross_amount", precision = 18, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "commission_amount", precision = 18, scale = 2)
    private BigDecimal commissionAmount;

    @Column(name = "refund_amount", precision = 18, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "net_amount", precision = 18, scale = 2)
    private BigDecimal netAmount;
}
