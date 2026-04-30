package com.HTPj.htpj.dto.response.kyc;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationInfoResponse {
    private Integer verificationId;
    private Integer legalInformationId;
    private String legalName;
    private String taxCode;
    private String businessLicenseNumber;
    private String representativeName;
    private String representativeCICNumber;
}
