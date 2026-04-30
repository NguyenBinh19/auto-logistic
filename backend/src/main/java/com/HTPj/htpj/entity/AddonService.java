package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "addon_services")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddonService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "service_name", nullable = false, length = 255)
    private String serviceName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "net_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPrice;

    @Column(name = "public_price", precision = 12, scale = 2)
    private BigDecimal publicPrice;

    @Column(name = "unit", nullable = false,columnDefinition = "NVARCHAR(50)", length = 50)
    private String unit;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "require_service_date")
    private Boolean requireServiceDate;

    @Column(name = "require_flight_info")
    private Boolean requireFlightInfo;

    @Column(name = "require_special_note")
    private Boolean requireSpecialNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
