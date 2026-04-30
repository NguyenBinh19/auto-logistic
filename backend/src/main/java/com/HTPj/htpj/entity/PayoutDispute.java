package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payout_disputes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayoutDispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispute_id")
    private Long disputeId;

    @OneToOne
    @JoinColumn(name = "statement_id", nullable = false)
    private PayoutStatement statement;

    @Column(name = "reason_details", columnDefinition = "NVARCHAR(MAX)")
    private String reasonDetails;

    @Column(name = "admin_report", columnDefinition = "NVARCHAR(MAX)")
    private String adminReport;

    @Column(name = "status", length = 30)
    private String status; // PENDING, RESOLVED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 255)
    private String resolvedBy;

    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayoutDisputeImage> images = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}