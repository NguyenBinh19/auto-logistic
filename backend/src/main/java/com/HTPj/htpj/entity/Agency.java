package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "agencies")
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agency_id")
    private Long agencyId;

    @Column(name = "agency_name", nullable = false, length = 255, columnDefinition = "nvarchar(255)")
    private String agencyName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "hotline", length = 50)
    private String hotline;

    @Column(name = "address",columnDefinition = "nvarchar(255)")
    private String address;

    @Column(name = "credit_limit")
    private BigDecimal creditLimit;

    @Column(name = "current_credit")
    private BigDecimal currentCredit;

    @Column(name = "wallet_balance", precision = 18, scale = 2)
    private BigDecimal walletBalance;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "agency")
    private List<PartnerVerification> verifications;

    @ManyToOne
    @JoinColumn(name = "rank_id")
    private Rank rank;

}
