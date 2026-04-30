package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;

public interface RevenueReportService {
    RevenueReportResponse generateReport(RevenueReportRequest request);
}
