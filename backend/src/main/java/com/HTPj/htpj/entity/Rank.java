package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ranks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "rank_name", columnDefinition = "NVARCHAR(255)")
    private String rankName;

    @Column(name = "description", columnDefinition = "NVARCHAR(255)")
    private String description;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "upgrade_min_total_revenue")
    private BigDecimal upgradeMinTotalRevenue;

    @Column(name = "maintain_min_revenue")
    private BigDecimal maintainMinRevenue;

    @Column(name = "credit_limit")
    private BigDecimal creditLimit;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "color")
    private String color;

    @Column(name = "icon")
    private String icon;

    @Column(name = "rank_code", nullable = false, unique = true)
    private String rankCode;

    @OneToMany(mappedBy = "rank")
    private List<Agency> agencies;
}