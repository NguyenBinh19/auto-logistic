package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "partner_blacklist")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PartnerBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    Long partnerId;

    String partnerType;

    String reason;

    String evidence;

    String legalName;

    String taxCode;

    String businessLicenseNumber;

    String representativeCicNumber;

    String bannedBy;

    LocalDateTime createdAt;
}