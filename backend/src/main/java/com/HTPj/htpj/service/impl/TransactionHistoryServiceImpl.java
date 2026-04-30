package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto;
import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionSummaryDto;
import com.HTPj.htpj.repository.TransactionHistoryRepository;
import com.HTPj.htpj.service.TransactionHistoryService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionHistoryServiceImpl implements TransactionHistoryService {

    private final TransactionHistoryRepository transactionHistoryRepo;

    public List<TransactionHistoryDto> getRecentByAgency(Long agencyId, int limit) {
        return transactionHistoryRepo.findRecentByAgencyId(agencyId, PageRequest.of(0, limit));
    }

    public Page<TransactionHistoryDto> getTransactionsByAgency(
            Long agencyId, int page, int size,
            String dateFrom, String dateTo,
            String type, String source) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());

        LocalDateTime from = dateFrom != null && !dateFrom.isEmpty()
                ? LocalDate.parse(dateFrom).atStartOfDay()
                : null;
        LocalDateTime to = dateTo != null && !dateTo.isEmpty()
                ? LocalDate.parse(dateTo).atTime(23, 59, 59)
                : null;

        return transactionHistoryRepo.findByFilters(agencyId, from, to, type, source, pageable);
    }

    public ByteArrayInputStream exportToExcel(Long agencyId,
                                              String dateFrom,
                                              String dateTo,
                                              String type,
                                              String source) {
        LocalDateTime from = dateFrom != null && !dateFrom.isEmpty()
                ? LocalDate.parse(dateFrom).atStartOfDay()
                : null;
        LocalDateTime to = dateTo != null && !dateTo.isEmpty()
                ? LocalDate.parse(dateTo).atTime(23, 59, 59)
                : null;

        List<TransactionHistoryDto> transactions =
                transactionHistoryRepo.findByFiltersWOPageable(agencyId, from, to, type, source);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transactions");

            String[] headers = {"Mã GD", "Thời gian", "Loại GD", "Nội dung", "Nguồn", "Số tiền", "Số dư sau", "Trạng thái"};
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (TransactionHistoryDto tx : transactions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(tx.transactionCode());
                row.createCell(1).setCellValue(tx.transactionDate().toString());
                row.createCell(2).setCellValue(tx.transactionType());
                row.createCell(3).setCellValue(tx.description());
                row.createCell(4).setCellValue(tx.sourceType());
                row.createCell(5).setCellValue(tx.amount().doubleValue());
                row.createCell(6).setCellValue(tx.balanceAfter().doubleValue());
                row.createCell(7).setCellValue(tx.status());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel", e);
        }
    }

    public TransactionSummaryDto getSummary(Long agencyId) {
        YearMonth current = YearMonth.now();
        YearMonth prev = current.minusMonths(1);

        BigDecimal spending = transactionHistoryRepo.getTotalSpending(
                agencyId, current.getYear(), current.getMonthValue());
        BigDecimal topup = transactionHistoryRepo.getTotalTopup(
                agencyId, current.getYear(), current.getMonthValue());
        BigDecimal penalty = transactionHistoryRepo.getTotalPenalty(
                agencyId, current.getYear(), current.getMonthValue());

        BigDecimal spendingPrev = transactionHistoryRepo.getTotalSpending(
                agencyId, prev.getYear(), prev.getMonthValue());
        BigDecimal topupPrev = transactionHistoryRepo.getTotalTopup(
                agencyId, prev.getYear(), prev.getMonthValue());
        BigDecimal penaltyPrev = transactionHistoryRepo.getTotalPenalty(
                agencyId, prev.getYear(), prev.getMonthValue());

        double spendingGrowth = calcGrowth(spending, spendingPrev);
        double topupGrowth = calcGrowth(topup, topupPrev);
        double penaltyGrowth = calcGrowth(penalty, penaltyPrev);

        return new TransactionSummaryDto(spending, topup, penalty,
                spendingGrowth, topupGrowth, penaltyGrowth);
    }

    private double calcGrowth(BigDecimal current, BigDecimal prev) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return current.subtract(prev)
                .divide(prev, 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
