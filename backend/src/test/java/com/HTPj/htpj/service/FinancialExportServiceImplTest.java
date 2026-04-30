//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.financial.ExportFinancialRequest;
//import com.HTPj.htpj.dto.response.financial.ExportResponse;
//import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;
//import com.HTPj.htpj.entity.PayoutStatement;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.PayoutStatementRepository;
//import com.HTPj.htpj.service.impl.FinancialExportServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.Collections;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class FinancialExportServiceImplTest {
//
//    @Mock
//    private RevenueReportService revenueReportService;
//    @Mock
//    private PayoutStatementRepository statementRepository;
//
//    @InjectMocks
//    private FinancialExportServiceImpl financialExportService;
//
//    private ExportFinancialRequest request;
//
//    @BeforeEach
//    void setUp() {
//        request = new ExportFinancialRequest();
//        request.setHotelId(1);
//        request.setStartDate(LocalDate.of(2026, 1, 1));
//        request.setEndDate(LocalDate.of(2026, 1, 31));
//        request.setReportType("REVENUE");
//        request.setFormat("EXCEL");
//    }
//
//    // --- Test Validation (Bắt lỗi đầu vào) ---
//    private RevenueReportResponse createMockRevenueReport() {
//        // 1. Tạo Summary (Tổng quan)
//        RevenueReportResponse.RevenueSummary summary = RevenueReportResponse.RevenueSummary.builder()
//                .totalRevenue(new BigDecimal("50000000"))
//                .totalBookings(25)
//                .totalRoomNightsSold(45)
//                .occupancyRate(85.0)
//                .adr(new BigDecimal("1200000"))
//                .revPar(new BigDecimal("1020000"))
//                .build();
//
//        // 2. Tạo Trend Item (Dữ liệu theo dòng thời gian)
//        RevenueReportResponse.RevenueTrendItem trendItem = RevenueReportResponse.RevenueTrendItem.builder()
//                .period("2026-04-14")
//                .revenue(new BigDecimal("5000000"))
//                .bookings(3)
//                .roomNightsSold(5)
//                .occupancyRate(80.0)
//                .build();
//
//        // 3. Tạo Revenue By Room Type (Dữ liệu theo loại phòng)
//        RevenueReportResponse.RevenueByRoomType roomTypeItem = RevenueReportResponse.RevenueByRoomType.builder()
//                .roomTypeId(101)
//                .roomTypeName("Deluxe Ocean View")
//                .revenue(new BigDecimal("3000000"))
//                .roomNightsSold(2)
//                .contribution(60.0)
//                .build();
//
//        // 4. Kết hợp tất cả vào Object chính
//        return RevenueReportResponse.builder()
//                .summary(summary)
//                .trend(List.of(trendItem))
//                .byRoomType(List.of(roomTypeItem))
//                .build();
//    }
//
//    @Test
//    void exportReport_StartDateNull_ShouldThrowAppException() {
//        // GIVEN: EndDate có nhưng StartDate null
//        request.setStartDate(null);
//        request.setEndDate(LocalDate.of(2026, 4, 30));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> financialExportService.exportReport(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REPORT_INVALID_DATE_RANGE);
//    }
//
//    @Test
//    void exportReport_EndDateNull_ShouldThrowAppException() {
//        // GIVEN
//        request.setStartDate(LocalDate.of(2026, 4, 1));
//        request.setEndDate(null);
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> financialExportService.exportReport(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REPORT_INVALID_DATE_RANGE);
//    }
//
//    @Test
//    void exportReport_InvalidReportType_ShouldThrowAppException() {
//        // GIVEN: Truyền một loại báo cáo không tồn tại trong switch-case
//        request.setReportType("GHOST_REPORT");
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> financialExportService.exportReport(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EXPORT_INVALID_TYPE);
//    }
//
//    // --- Test Defaults & Routing (Tham số mặc định và Điều hướng) ---
//
//    @Test
//    void exportReport_NullTypeAndFormat_ShouldDefaultToRevenueExcel() {
//        // GIVEN: Request chỉ có ngày, type và format để null
//        request.setReportType(null);
//        request.setFormat(null);
//
//        // Giả lập dữ liệu cho hàm exportRevenue phía sau để không bị lỗi No Data
//        RevenueReportResponse mockReport = createMockRevenueReport();
//        when(revenueReportService.generateReport(any())).thenReturn(mockReport);
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN: Kiểm tra xem nó có tự động chọn REVENUE và EXCEL không
//        assertThat(response.getFileName()).endsWith(".xlsx");
//        assertThat(response.getContentType()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//
//        // Xác nhận là service Revenue đã được gọi chứ không phải Payout
//        verify(revenueReportService, times(1)).generateReport(any());
//        verifyNoInteractions(statementRepository);
//    }
//
//    @Test
//    void exportReport_PayoutType_ShouldRouteToExportPayout() {
//        // GIVEN
//        request.setReportType("PAYOUT");
//        request.setFormat("PDF");
//        // Đảm bảo request có hotelId (mặc định đã set trong setUp là 1, nhưng nên set lại cho rõ ràng)
//        request.setHotelId(1);
//
//        // Giả lập dữ liệu cho hàm exportPayout
//        PayoutStatement statement = new PayoutStatement();
//        statement.setStatementCode("PAY-001");
//
//        // QUAN TRỌNG: Phải set HotelId để tránh NullPointerException khi filter
//        statement.setHotelId(1);
//
//        // Bổ sung các field cần thiết khác để tránh lỗi khi render PDF/Excel
//        statement.setPeriodStart(request.getStartDate());
//        statement.setPeriodEnd(request.getEndDate());
//        statement.setGrossRevenue(BigDecimal.ZERO);
//        statement.setTotalCommission(BigDecimal.ZERO);
//        statement.setNetPayout(BigDecimal.ZERO);
//        statement.setStatus("PENDING");
//
//        when(statementRepository.findByPeriod(any(), any())).thenReturn(List.of(statement));
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN
//        assertThat(response.getFileName()).contains("Payouts");
//        assertThat(response.getFileName()).endsWith(".pdf");
//
//        verify(statementRepository, times(1)).findByPeriod(any(), any());
//        verifyNoInteractions(revenueReportService);
//    }
//
//    @Test
//    void exportRevenue_NoTrendData_ShouldThrowException() {
//        // GIVEN
//        request.setReportType("REVENUE");
//
//        // Giả lập report có trend rỗng
//        RevenueReportResponse emptyReport = RevenueReportResponse.builder()
//                .trend(Collections.emptyList())
//                .build();
//
//        when(revenueReportService.generateReport(any())).thenReturn(emptyReport);
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> financialExportService.exportReport(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EXPORT_NO_DATA);
//    }
//
//    @Test
//    void exportRevenue_Excel_Success() {
//        // GIVEN
//        request.setReportType("REVENUE");
//        request.setFormat("EXCEL");
//
//        when(revenueReportService.generateReport(any())).thenReturn(createMockRevenueReport());
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN
//        assertThat(response.getFileName()).startsWith("Revenue_");
//        assertThat(response.getFileName()).endsWith(".xlsx");
//        assertThat(response.getContentType()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//        assertThat(response.getData()).isNotEmpty();
//
//        verify(revenueReportService).generateReport(argThat(r -> r.getGranularity().equals("DAILY")));
//    }
//
//    @Test
//    void exportRevenue_Pdf_Success() {
//        // GIVEN
//        request.setReportType("REVENUE");
//        request.setFormat("PDF");
//
//        when(revenueReportService.generateReport(any())).thenReturn(createMockRevenueReport());
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN
//        assertThat(response.getFileName()).endsWith(".pdf");
//        assertThat(response.getContentType()).isEqualTo("application/pdf");
//        assertThat(response.getData()).isNotEmpty();
//    }
//
//    @Test
//    void exportRevenue_Csv_Success() {
//        // GIVEN
//        request.setReportType("REVENUE");
//        request.setFormat("CSV");
//
//        when(revenueReportService.generateReport(any())).thenReturn(createMockRevenueReport());
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN
//        assertThat(response.getFileName()).endsWith(".csv");
//        assertThat(response.getContentType()).isEqualTo("text/csv");
//
//        // Kiểm tra nội dung CSV có chứa dữ liệu từ mock không
//        String content = new String(response.getData());
//        assertThat(content).contains("Period,Revenue,Bookings"); // Header
//        assertThat(content).contains("2026-04-14"); // Dữ liệu từ trend
//    }
//    @Test
//    void exportRevenue_PdfGenerationError_ShouldThrowAppException() {
//        // GIVEN
//        request.setFormat("PDF");
//
//        // Tạo một report mà summary bị null hoàn toàn
//        // Gây ra NullPointerException bên trong exportRevenuePdf khi gọi s.getTotalRevenue()
//        RevenueReportResponse badReport = RevenueReportResponse.builder()
//                .trend(List.of(RevenueReportResponse.RevenueTrendItem.builder().build()))
//                .summary(null)
//                .build();
//
//        when(revenueReportService.generateReport(any())).thenReturn(badReport);
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> financialExportService.exportReport(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EXPORT_GENERATION_FAILED);
//    }
//    @Test
//    void exportRevenue_UnknownFormat_ShouldFallbackToExcel() {
//        // GIVEN: Truyền format "XYZ" không nằm trong PDF/CSV
//        request.setFormat("XYZ");
//        when(revenueReportService.generateReport(any())).thenReturn(createMockRevenueReport());
//
//        // WHEN
//        ExportResponse response = financialExportService.exportReport(request);
//
//        // THEN: Phải fallback về Excel
//        assertThat(response.getFileName()).endsWith(".xlsx");
//        assertThat(response.getContentType()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//    }
//
//}
