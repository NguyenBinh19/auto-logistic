package com.HTPj.htpj.dto.request.rank;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRankPeriodRequest {
    private String type;
    private String value;
}
