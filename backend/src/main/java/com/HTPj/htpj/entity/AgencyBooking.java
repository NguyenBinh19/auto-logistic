package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "agency_booking")
public class AgencyBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agency_booking_id")
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "month", nullable = false, length = 7)
    private String month;

    @Column(name = "total_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "penalty_interest", precision = 18, scale = 2)
    private BigDecimal penaltyInterest = BigDecimal.ZERO;

    @Column(name = "principal_remaining", precision = 18, scale = 2)
    private BigDecimal principalRemaining = BigDecimal.ZERO;

    @Column(name = "late_days")
    private Integer lateDays;

    @Column(name = "late_working_days")
    private Integer lateWorkingDays;

    @Column(name = "last_interest_calculated_date")
    private LocalDate lastInterestCalculatedDate;

    @Column(name = "penalty_rate", precision = 10, scale = 7)
    private BigDecimal penaltyRate;

    // Trong AgencyBooking
    @OneToMany(mappedBy = "agencyBooking", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Booking> bookings;

}
