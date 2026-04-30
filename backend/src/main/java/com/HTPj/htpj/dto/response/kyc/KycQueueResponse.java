package com.HTPj.htpj.dto.response.kyc;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycQueueResponse {

    private Integer id;
    private String status;
    private LocalDateTime submittedAt;
    private String partnerType;
    private String reviewedBy;
    private String legalName;
    private String taxCode;
    private Long agencyId;
    private Integer hotelId;
}