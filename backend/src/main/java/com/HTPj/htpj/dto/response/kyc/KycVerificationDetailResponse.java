package com.HTPj.htpj.dto.response.kyc;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycVerificationDetailResponse {

    private Integer id;
    private String status;
    private Integer version;

    private String partnerType;

    private String submittedBy;
    private LocalDateTime submittedAt;

    private String reviewedBy;
    private LocalDateTime reviewedAt;

    private String rejectionReason;

    private String legalName;
    private String taxCode;
    private String businessAddress;

    private String representativeName;
    private String representativeCICNumber;
    private String businessLicenseNumber;
    private LocalDate representativeCICDate;
    private String representativeCICPlace;

    private Long agencyId;
    private Integer hotelId;

    private List<KycDocumentResponse> documents;

}