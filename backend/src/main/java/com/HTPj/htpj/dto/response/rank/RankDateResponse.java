package com.HTPj.htpj.dto.response.rank;

import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankDateResponse {
    private LocalDate startDate;
    private LocalDate endDate;
}
