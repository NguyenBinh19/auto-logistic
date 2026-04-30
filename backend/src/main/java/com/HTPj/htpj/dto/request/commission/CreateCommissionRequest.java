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
public class CreateCommissionRequest {
    private String commissionType;
    private String rateType;
    private BigDecimal commissionValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private String note;
    private List<Integer> hotelIds;
}