package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "agency_credit_history")
public class AgencyCreditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(name = "credit_before", nullable = false, precision = 18, scale = 2)
    private BigDecimal creditBefore;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "credit_after", nullable = false, precision = 18, scale = 2)
    private BigDecimal creditAfter;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "description", length = 500, columnDefinition = "nvarchar(500)")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}