package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PayoutListRequest {
    private String status;          // APPROVED, PROCESSING, PAID, ON_HOLD, ROLLOVER
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Integer hotelId;        // optional filter
    private Boolean includeDisputed;
}
