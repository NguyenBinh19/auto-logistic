package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.ExportFinancialRequest;
import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
import com.HTPj.htpj.dto.response.financial.*;
import com.HTPj.htpj.entity.PayoutStatement;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.PayoutStatementRepository;
import com.HTPj.htpj.service.FinancialExportService;
import com.HTPj.htpj.service.RevenueReportService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FinancialExportServiceImpl implements FinancialExportService {

    private final RevenueReportService revenueReportService;
    private final PayoutStatementRepository statementRepository;

    private static final DateTimeFormatter FILE_TS = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Override
    public ExportResponse exportReport(ExportFinancialRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new AppException(ErrorCode.REPORT_INVALID_DATE_RANGE);
        }

        String reportType = request.getReportType() != null ? request.getReportType() : "REVENUE";
        String format = request.getFormat() != null ? request.getFormat() : "EXCEL";

        return switch (reportType.toUpperCase()) {
            case "REVENUE" -> exportRevenue(request, format);
            case "PAYOUT" -> exportPayout(request, format);
            default -> throw new AppException(ErrorCode.EXPORT_INVALID_TYPE);
        };
    }

    // ---- Revenue Export ----

    private ExportResponse exportRevenue(ExportFinancialRequest request, String format) {
        RevenueReportRequest rr = new RevenueReportRequest();
        rr.setHotelId(request.getHotelId());
        rr.setStartDate(request.getStartDate());
        rr.setEndDate(request.getEndDate());
        rr.setGranularity("DAILY");

        RevenueReportResponse report = revenueReportService.generateReport(rr);

        if (report.getTrend() == null || report.getTrend().isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_NO_DATA);
        }

        String baseName = "Revenue_" + request.getStartDate() + "_" + request.getEndDate()
                + "_" + LocalDateTime.now().format(FILE_TS);

        return switch (format.toUpperCase()) {
            case "PDF" -> exportRevenuePdf(report, baseName);
            case "CSV" -> exportRevenueCsv(report, baseName);
            default -> exportRevenueExcel(report, baseName);
        };
    }

    private ExportResponse exportRevenueExcel(RevenueReportResponse report, String baseName) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Revenue Report");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Summary section
            int rowIdx = 0;
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("Revenue Report");

            rowIdx++; // blank line
            Row sumHead = sheet.createRow(rowIdx++);
            createHeaderCell(sumHead, 0, "Metric", headerStyle);
            createHeaderCell(sumHead, 1, "Value", headerStyle);

            RevenueReportResponse.RevenueSummary s = report.getSummary();
            addSummaryRow(sheet, rowIdx++, "Total Revenue", s.getTotalRevenue());
            addSummaryRow(sheet, rowIdx++, "Total Bookings", BigDecimal.valueOf(s.getTotalBookings()));
            addSummaryRow(sheet, rowIdx++, "Room Nights Sold", BigDecimal.valueOf(s.getTotalRoomNightsSold()));
            addSummaryRow(sheet, rowIdx++, "Occupancy Rate (%)", BigDecimal.valueOf(s.getOccupancyRate()));
            addSummaryRow(sheet, rowIdx++, "ADR", s.getAdr());
            addSummaryRow(sheet, rowIdx++, "RevPAR", s.getRevPar());

            rowIdx += 2;

            // Trend data
            Row trendHeader = sheet.createRow(rowIdx++);
            createHeaderCell(trendHeader, 0, "Period", headerStyle);
            createHeaderCell(trendHeader, 1, "Revenue", headerStyle);
            createHeaderCell(trendHeader, 2, "Bookings", headerStyle);
            createHeaderCell(trendHeader, 3, "Room Nights Sold", headerStyle);
            createHeaderCell(trendHeader, 4, "Occupancy %", headerStyle);

            for (RevenueReportResponse.RevenueTrendItem item : report.getTrend()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getPeriod());
                row.createCell(1).setCellValue(item.getRevenue() != null ? item.getRevenue().doubleValue() : 0);
                row.createCell(2).setCellValue(item.getBookings());
                row.createCell(3).setCellValue(item.getRoomNightsSold());
                row.createCell(4).setCellValue(item.getOccupancyRate() != null ? item.getOccupancyRate() : 0);
            }

            for (int i = 0; i < 5; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ExportResponse.builder()
                    .fileName(baseName + ".xlsx")
                    .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .data(out.toByteArray())
                    .build();
        } catch (IOException e) {
            throw new AppException(ErrorCode.EXPORT_GENERATION_FAILED);
        }
    }

    private ExportResponse exportRevenuePdf(RevenueReportResponse report, String baseName) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            document.add(new Paragraph("Revenue Report", titleFont));
            document.add(new Paragraph(" "));

            // Summary table
            RevenueReportResponse.RevenueSummary s = report.getSummary();
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);
            summaryTable.setHorizontalAlignment(Element.ALIGN_LEFT);
            addPdfHeaderRow(summaryTable, "Metric", "Value");
            addPdfRow(summaryTable, "Total Revenue", formatDecimal(s.getTotalRevenue()));
            addPdfRow(summaryTable, "Total Bookings", String.valueOf(s.getTotalBookings()));
            addPdfRow(summaryTable, "Occupancy Rate", s.getOccupancyRate() + "%");
            addPdfRow(summaryTable, "ADR", formatDecimal(s.getAdr()));
            addPdfRow(summaryTable, "RevPAR", formatDecimal(s.getRevPar()));
            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // Trend table
            PdfPTable trendTable = new PdfPTable(5);
            trendTable.setWidthPercentage(100);
            addPdfHeaderRow(trendTable, "Period", "Revenue", "Bookings", "Room Nights", "Occupancy %");

            for (RevenueReportResponse.RevenueTrendItem item : report.getTrend()) {
                trendTable.addCell(item.getPeriod());
                trendTable.addCell(formatDecimal(item.getRevenue()));
                trendTable.addCell(String.valueOf(item.getBookings()));
                trendTable.addCell(String.valueOf(item.getRoomNightsSold()));
                trendTable.addCell(item.getOccupancyRate() + "%");
            }
            document.add(trendTable);

            document.close();

            return ExportResponse.builder()
                    .fileName(baseName + ".pdf")
                    .contentType("application/pdf")
                    .data(out.toByteArray())
                    .build();
        } catch (Exception e) {
            throw new AppException(ErrorCode.EXPORT_GENERATION_FAILED);
        }
    }

    private ExportResponse exportRevenueCsv(RevenueReportResponse report, String baseName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Period,Revenue,Bookings,Room Nights Sold,Occupancy %\n");
        for (RevenueReportResponse.RevenueTrendItem item : report.getTrend()) {
            sb.append(item.getPeriod()).append(",")
                    .append(formatDecimal(item.getRevenue())).append(",")
                    .append(item.getBookings()).append(",")
                    .append(item.getRoomNightsSold()).append(",")
                    .append(item.getOccupancyRate()).append("\n");
        }

        return ExportResponse.builder()
                .fileName(baseName + ".csv")
                .contentType("text/csv")
                .data(sb.toString().getBytes())
                .build();
    }

    // ---- Payout Export ----

    private ExportResponse exportPayout(ExportFinancialRequest request, String format) {
        List<PayoutStatement> statements;
        if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
            statements = statementRepository.findByStatuses(request.getStatuses());
        } else {
            statements = statementRepository.findByPeriod(request.getStartDate(), request.getEndDate());
        }

        if (request.getHotelId() != null) {
            statements = statements.stream()
                    .filter(s -> s.getHotelId().equals(request.getHotelId()))
                    .toList();
        }

        if (statements.isEmpty()) {
            throw new AppException(ErrorCode.EXPORT_NO_DATA);
        }

        String baseName = "Payouts_" + request.getStartDate() + "_" + request.getEndDate()
                + "_" + LocalDateTime.now().format(FILE_TS);

        return switch (format.toUpperCase()) {
            case "PDF" -> exportPayoutPdf(statements, baseName);
            case "CSV" -> exportPayoutCsv(statements, baseName);
            default -> exportPayoutExcel(statements, baseName);
        };
    }

    private ExportResponse exportPayoutExcel(List<PayoutStatement> statements, String baseName) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Payout List");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            String[] cols = {"Statement Code", "Hotel ID", "Period Start", "Period End",
                    "Gross Revenue", "Commission", "Refunds", "Net Payout", "Status"};
            for (int i = 0; i < cols.length; i++) {
                createHeaderCell(header, i, cols[i], headerStyle);
            }

            for (PayoutStatement s : statements) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getStatementCode());
                row.createCell(1).setCellValue(s.getHotelId());
                row.createCell(2).setCellValue(s.getPeriodStart().toString());
                row.createCell(3).setCellValue(s.getPeriodEnd().toString());
                row.createCell(4).setCellValue(safeDouble(s.getGrossRevenue()));
                row.createCell(5).setCellValue(safeDouble(s.getTotalCommission()));
                row.createCell(6).setCellValue(safeDouble(s.getTotalRefunds()));
                row.createCell(7).setCellValue(safeDouble(s.getNetPayout()));
                row.createCell(8).setCellValue(s.getStatus());
            }

            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ExportResponse.builder()
                    .fileName(baseName + ".xlsx")
                    .contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .data(out.toByteArray())
                    .build();
        } catch (IOException e) {
            throw new AppException(ErrorCode.EXPORT_GENERATION_FAILED);
        }
    }

    private ExportResponse exportPayoutPdf(List<PayoutStatement> statements, String baseName) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            document.add(new Paragraph("Payout Statement Report", titleFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            addPdfHeaderRow(table, "Code", "Hotel", "Period", "Gross", "Commission", "Net Payout", "Status");

            for (PayoutStatement s : statements) {
                table.addCell(s.getStatementCode());
                table.addCell(String.valueOf(s.getHotelId()));
                table.addCell(s.getPeriodStart() + " - " + s.getPeriodEnd());
                table.addCell(formatDecimal(s.getGrossRevenue()));
                table.addCell(formatDecimal(s.getTotalCommission()));
                table.addCell(formatDecimal(s.getNetPayout()));
                table.addCell(s.getStatus());
            }
            document.add(table);
            document.close();

            return ExportResponse.builder()
                    .fileName(baseName + ".pdf")
                    .contentType("application/pdf")
                    .data(out.toByteArray())
                    .build();
        } catch (DocumentException e) {
            throw new AppException(ErrorCode.EXPORT_GENERATION_FAILED);
        }
    }

    private ExportResponse exportPayoutCsv(List<PayoutStatement> statements, String baseName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Statement Code,Hotel ID,Period Start,Period End,Gross Revenue,Commission,Refunds,Net Payout,Status\n");
        for (PayoutStatement s : statements) {
            sb.append(s.getStatementCode()).append(",")
                    .append(s.getHotelId()).append(",")
                    .append(s.getPeriodStart()).append(",")
                    .append(s.getPeriodEnd()).append(",")
                    .append(formatDecimal(s.getGrossRevenue())).append(",")
                    .append(formatDecimal(s.getTotalCommission())).append(",")
                    .append(formatDecimal(s.getTotalRefunds())).append(",")
                    .append(formatDecimal(s.getNetPayout())).append(",")
                    .append(s.getStatus()).append("\n");
        }

        return ExportResponse.builder()
                .fileName(baseName + ".csv")
                .contentType("text/csv")
                .data(sb.toString().getBytes())
                .build();
    }

    // ---- Helpers ----

    private void createHeaderCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void addSummaryRow(Sheet sheet, int rowIdx, String label, BigDecimal value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value != null ? value.doubleValue() : 0);
    }

    private void addPdfHeaderRow(PdfPTable table, String... headers) {
        Font font = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(new Color(51, 51, 51));
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private void addPdfRow(PdfPTable table, String label, String value) {
        table.addCell(new Phrase(label, new Font(Font.HELVETICA, 9)));
        table.addCell(new Phrase(value, new Font(Font.HELVETICA, 9)));
    }

    private String formatDecimal(BigDecimal val) {
        return val != null ? val.toPlainString() : "0";
    }

    private double safeDouble(BigDecimal val) {
        return val != null ? val.doubleValue() : 0;
    }
}
