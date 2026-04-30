package com.HTPj.htpj.dto.request.commission;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCommissionRequest {
    private Long commissionId;
    private String rateType;
    private BigDecimal commissionValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String note;
    private List<Integer> hotelIds;
    private String reason;
}
