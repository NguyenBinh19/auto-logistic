package com.HTPj.htpj.dto.response.agency;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyResponse {
    private Long agencyId;
    private String agencyName;
    private String email;
    private String contactPhone;
    private String hotline;
    private String address;
    private BigDecimal creditLimit;
    private BigDecimal currentCredit;
    private String status;
}
