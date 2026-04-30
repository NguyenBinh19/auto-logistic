package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_pricing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;

    @Column(name = "room_type_id", nullable = false)
    private Integer roomTypeId;

    @Column(name = "rule_name")
    private String ruleName;

    // WEEKLY | EVENT
    @Column(name = "rule_type", nullable = false)
    private String ruleType;

    // Monday, Tuesday... (only for WEEKLY)
    @Column(name = "day_of_week")
    private String dayOfWeek;

    // only for EVENT
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // INCREASE | DECREASE | KEEP
    @Column(name = "action", nullable = false)
    private String action;

    // FIXED | PERCENT
    @Column(name = "adjustment_type", nullable = false)
    private String adjustmentType;

    @Column(name = "adjustment_value", nullable = false)
    private BigDecimal adjustmentValue;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (priority == null) priority = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}