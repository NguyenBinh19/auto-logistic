package com.HTPj.htpj.dto.request.rank;

import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankEvaluateRequest {
    private LocalDate startDate;
    private LocalDate endDate;
}
