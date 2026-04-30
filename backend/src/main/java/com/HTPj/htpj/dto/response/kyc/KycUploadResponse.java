package com.HTPj.htpj.dto.response.kyc;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycUploadResponse {
    private Integer verificationId;
    private String status;

}
