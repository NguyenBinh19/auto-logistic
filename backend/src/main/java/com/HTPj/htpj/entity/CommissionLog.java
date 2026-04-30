package com.HTPj.htpj.entity;

import lombok.*;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "commission_logs")
public class CommissionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "old_rate_type")
    private String oldRateType;

    @Column(name = "new_rate_type")
    private String newRateType;

    @Column(name = "old_commission_id")
    private Long oldCommissionId;

    @Column(name = "old_value")
    private BigDecimal oldValue;

    @Column(name = "old_commission_type")
    private String oldCommissionType;

    @Column(name = "new_commission_id", nullable = false)
    private Long newCommissionId;

    @Column(name = "new_value", nullable = false)
    private BigDecimal newValue;

    @Column(name = "new_commission_type", nullable = false)
    private String newCommissionType;

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    @Column(name = "note")
    private String note;
}