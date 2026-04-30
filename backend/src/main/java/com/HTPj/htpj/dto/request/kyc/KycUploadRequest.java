package com.HTPj.htpj.dto.request.kyc;

import java.time.LocalDate;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycUploadRequest {
    private String partnerType;
    private String legalName;
    private String taxCode;
    private String businessAddress;
    private String representativeName;
    private String representativeCICNumber;
    private String businessLicenseNumber;
    private LocalDate representativeCICDate;
    private String representativeCICPlace;
    private List<String> documentTypes;
//    private Long agencyId;
//    private Integer hotelId;
}
