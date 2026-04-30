package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hotel_id")
    private Integer hotelId;

    @Column(name = "hotel_name", nullable = false, length = 255)
    private String hotelName;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "star_rating")
    private Integer starRating;

    @Column(name = "amenities", columnDefinition = "NVARCHAR(MAX)")
    private String amenities;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "commission_value")
    private BigDecimal commissionValue;

    @Column(name = "rate_type")
    private String rateType;

    @Column(name = "commission_id")
    private Long commissionId;

    @Column(name = "commission_updated_at")
    private LocalDateTime commissionUpdatedAt;

    @Column(name = "commission_updated_by")
    private String commissionUpdatedBy;

    @Column(name = "commission_type")
    private String commissionType;

    @Column(name = "bank_name", columnDefinition = "NVARCHAR(255)")
    private String bankName;

    @Column(name = "bank_account_holder", columnDefinition = "NVARCHAR(255)")
    private String bankAccountHolder;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

}
