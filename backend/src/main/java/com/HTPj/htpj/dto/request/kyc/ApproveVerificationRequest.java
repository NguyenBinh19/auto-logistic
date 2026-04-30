package com.HTPj.htpj.dto.request.kyc;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApproveVerificationRequest {
    @JsonProperty("verificationId")
    private Integer verificationId;

//    @JsonProperty("reviewedBy")
//    private String reviewedBy;

    @JsonProperty("status")
    private String status;

    @JsonProperty("rejectionReason")
    private String rejectionReason;

    @JsonProperty("verificationBefore")
    private Boolean verificationBefore;

}