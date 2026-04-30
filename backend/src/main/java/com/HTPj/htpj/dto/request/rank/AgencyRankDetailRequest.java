package com.HTPj.htpj.dto.request.rank;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyRankDetailRequest {
    private Long agencyId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer targetRankId;
    private String changeType;
}
