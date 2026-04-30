package com.HTPj.htpj.dto.response.agency;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import com.HTPj.htpj.dto.response.rank.AgencyRankDetailResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyDetailResponse {
    private Long agencyId;
    private String agencyName;
    private String email;
    private String contactPhone;
    private String hotline;
    private String address;

    private BigDecimal creditLimit;
    private BigDecimal currentCredit;
    private BigDecimal walletBalance;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private VerificationInfoResponse verification;
    private Integer creditUsedPercent;

    private Integer rankId;
    private String rankName;
}
