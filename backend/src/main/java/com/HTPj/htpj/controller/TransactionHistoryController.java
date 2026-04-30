package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto;
import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionSummaryDto;
import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.service.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/transaction-history")
@RequiredArgsConstructor
public class TransactionHistoryController {

    private final TransactionHistoryService transactionHistoryService;

    @GetMapping("/{agencyId}/transactions/recent")
    public ApiResponse<List<TransactionHistoryDto>> getRecentTransactions(
            @PathVariable Long agencyId,
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.<List<TransactionHistoryDto>>builder()
                .result(transactionHistoryService.getRecentByAgency(agencyId, limit))
                .build();
    }

    @GetMapping("/{agencyId}/transactions")
    public ApiResponse<Page<TransactionHistoryDto>> getTransactions(
            @PathVariable Long agencyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(defaultValue = "ALL") String source) {

        Page<TransactionHistoryDto> result = transactionHistoryService
                .getTransactionsByAgency(agencyId, page, size, dateFrom, dateTo, type, source);

        return ApiResponse.<Page<TransactionHistoryDto>>builder()
                .result(result)
                .build();
    }

    @GetMapping("/{agencyId}/transactions/export")
    public ResponseEntity<InputStreamResource> exportTransactions(
            @PathVariable Long agencyId,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(defaultValue = "ALL") String source) {

        ByteArrayInputStream in = transactionHistoryService.exportToExcel(agencyId, dateFrom, dateTo, type, source);
        InputStreamResource file = new InputStreamResource(in);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=lich_su_giao_dich.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/{agencyId}/transactions/summary")
    public ApiResponse<TransactionSummaryDto> getSummary(@PathVariable Long agencyId) {
        return ApiResponse.<TransactionSummaryDto>builder()
                .result(transactionHistoryService.getSummary(agencyId))
                .build();
    }

}
