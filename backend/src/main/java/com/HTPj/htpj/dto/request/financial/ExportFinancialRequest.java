package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ExportFinancialRequest {
    private String reportType;     // REVENUE, PAYOUT, TRANSACTION
    private String format;         // EXCEL, PDF, CSV
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer hotelId;       // optional, null = all hotels (admin)
    private List<String> statuses; // optional filter for payout list
}
