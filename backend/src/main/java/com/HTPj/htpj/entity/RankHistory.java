package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rank_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_rank_id")
    private Rank oldRank;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_rank_id", nullable = false)
    private Rank newRank;

    @Column(name = "total_revenue_snapshot")
    private BigDecimal totalRevenueSnapshot;

    @Column(name = "change_type")
    private String changeType;

    @Column(name = "reason", columnDefinition = "nvarchar(500)")
    private String reason;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    @Column(name = "changed_by")
    private String changedBy;
}