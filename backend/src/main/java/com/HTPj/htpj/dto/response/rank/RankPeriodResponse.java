package com.HTPj.htpj.dto.response.rank;

import java.util.List;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankPeriodResponse {
    private List<RankPeriodItemResponse> periods;
}
