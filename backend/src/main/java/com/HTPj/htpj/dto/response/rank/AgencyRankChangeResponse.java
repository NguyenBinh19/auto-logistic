package com.HTPj.htpj.dto.response.rank;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencyRankChangeResponse {
    private Long agencyId;
    private String agencyName;
    private String email;
    private String currentRank;
    private String targetRank;
    private Integer targetRankId;
}
