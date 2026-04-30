package com.HTPj.htpj.dto.request.allotment;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkAllotmentUpdateRequest {

    private Integer roomTypeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer allotment;
    private List<String> daysOfWeek; // null = all days
}
