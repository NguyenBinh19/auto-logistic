package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_code", nullable = false, unique = true)
    private String transactionCode;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Column(name = "description")
    private String description;

    @Column(name = "source_type")
    private String sourceType;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "balance_after")
    private BigDecimal balanceAfter;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "direction", nullable = false)
    private String direction;

    @ManyToOne
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
