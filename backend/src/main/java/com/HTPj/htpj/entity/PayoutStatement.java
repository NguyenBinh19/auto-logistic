package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payout_statements")
public class PayoutStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statement_id")
    private Long statementId;

    @Column(name = "statement_code", nullable = false, unique = true, length = 50)
    private String statementCode;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "gross_revenue", precision = 18, scale = 2)
    private BigDecimal grossRevenue;

    @Column(name = "total_commission", precision = 18, scale = 2)
    private BigDecimal totalCommission;

    @Column(name = "total_refunds", precision = 18, scale = 2)
    private BigDecimal totalRefunds;

    @Column(name = "adjustments", precision = 18, scale = 2)
    private BigDecimal adjustments;

    @Column(name = "net_payout", precision = 18, scale = 2)
    private BigDecimal netPayout;

    @Column(name = "total_bookings")
    private Integer totalBookings;

    @Column(name = "total_room_nights")
    private Integer totalRoomNights;

    /**
     * Amount carried forward from previous ROLLOVER statement(s).
     * Included in netPayout of this statement.
     */
    @Column(name = "carried_forward_amount", precision = 18, scale = 2)
    private BigDecimal carriedForwardAmount;

    /**
     * DRAFT, PENDING_CONFIRMATION, APPROVED, DISPUTED, PROCESSING, PAID, ROLLOVER, MERGED
     * MERGED: a ROLLOVER statement that has been absorbed into the next cycle's statement.
     */
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "confirmed_by", length = 255)
    private String confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

//    @Column(name = "dispute_reason", columnDefinition = "NVARCHAR(MAX)")
//    private String disputeReason;
//
//    @Column(name = "dispute_reason_code", length = 50)
//    private String disputeReasonCode;

    @Column(name = "bank_reference", length = 100)
    private String bankReference;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "paid_by", length = 255)
    private String paidBy;

    @Column(name = "payment_proof_s3_key", length = 255)
    private String paymentProofS3Key;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "bank_name", columnDefinition = "NVARCHAR(255)")
    private String bankName;

    @Column(name = "bank_account_holder", columnDefinition = "NVARCHAR(255)")
    private String bankAccountHolder;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
