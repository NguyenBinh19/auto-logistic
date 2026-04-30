package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto;
import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionSummaryDto;
import org.springframework.data.domain.Page;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface TransactionHistoryService {
    public List<TransactionHistoryDto> getRecentByAgency(Long agencyId, int limit);
    public Page<TransactionHistoryDto> getTransactionsByAgency(
            Long agencyId, int page, int size,
            String dateFrom, String dateTo,
            String type, String source);
    public ByteArrayInputStream exportToExcel(Long agencyId, String dateFrom, String dateTo, String type, String source);
    public TransactionSummaryDto getSummary(Long agencyId);
}
