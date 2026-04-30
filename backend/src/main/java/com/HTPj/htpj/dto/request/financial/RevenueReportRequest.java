package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RevenueReportRequest {
    private Integer hotelId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String granularity; // DAILY, WEEKLY, MONTHLY
    private Long agencyId;      // optional filter
}
