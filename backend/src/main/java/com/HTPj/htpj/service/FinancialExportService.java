package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.financial.ExportFinancialRequest;
import com.HTPj.htpj.dto.response.financial.ExportResponse;

public interface FinancialExportService {
    ExportResponse exportReport(ExportFinancialRequest request);
}
