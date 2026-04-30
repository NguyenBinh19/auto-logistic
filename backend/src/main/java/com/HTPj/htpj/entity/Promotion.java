package com.HTPj.htpj.entity;

import jakarta.persistence.*;

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
@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false,columnDefinition = "nvarchar(255)")
    private String name;

    @Column(name = "type_promotion", nullable = false)
    private String typePromotion;

    @Column(name = "type_discount", nullable = false)
    private String typeDiscount;

    @Column(name = "discount_val", nullable = false)
    private BigDecimal discountVal;

    @Column(name = "max_discount")
    private BigDecimal maxDiscount;

    @Column(name = "min_order_val")
    private BigDecimal minOrderVal;

    @Column(name = "apply_start_date", nullable = false)
    private LocalDate applyStartDate;

    @Column(name = "apply_end_date", nullable = false)
    private LocalDate applyEndDate;

    @Column(name = "stay_start_date", nullable = false)
    private LocalDate stayStartDate;

    @Column(name = "stay_end_date", nullable = false)
    private LocalDate stayEndDate;

    @Column(name = "min_stay")
    private Integer minStay;

    @Column(name = "max_usage", nullable = false)
    private Integer maxUsage;

    @Column(name = "used_count")
    private Integer usedCount;

    @Column(name = "agency_usage_limit", nullable = false)
    private Integer agencyUsageLimit;

    private String status;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @OneToMany(mappedBy = "promotion", fetch = FetchType.LAZY)
    private List<Booking> bookings;
}