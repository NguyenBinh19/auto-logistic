//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto;
//import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionSummaryDto;
//import com.HTPj.htpj.repository.TransactionHistoryRepository;
//import com.HTPj.htpj.service.impl.TransactionHistoryServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Sort;
//
//import java.io.ByteArrayInputStream;
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.Collections;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class TransactionHistoryServiceImplTest {
//
//    @Mock
//    private TransactionHistoryRepository transactionHistoryRepo;
//
//    @InjectMocks
//    private TransactionHistoryServiceImpl transactionHistoryService;
//
//    private TransactionHistoryDto createMockDto(String code) {
//        return new TransactionHistoryDto(
//                1L,
//                code,
//                LocalDateTime.now(),
//                "Top-up",
//                "Nạp tiền SePay",
//                "Ví",
//                new BigDecimal("500000"),
//                new BigDecimal("1000000"),
//                "Success",
//                "IN"
//        );
//    }
//
//
//    @Test
//    void getRecentByAgency_Success() {
//        Long agencyId = 1L;
//        int limit = 5;
//        List<TransactionHistoryDto> mockList = List.of(createMockDto("TRK-001"));
//
//        when(transactionHistoryRepo.findRecentByAgencyId(eq(agencyId), any(PageRequest.class)))
//                .thenReturn(mockList);
//
//        List<TransactionHistoryDto> result = transactionHistoryService.getRecentByAgency(agencyId, limit);
//
//        assertThat(result).hasSize(1);
//        assertThat(result.get(0).transactionCode()).isEqualTo("TRK-001");
//        verify(transactionHistoryRepo).findRecentByAgencyId(eq(agencyId), argThat(pageable ->
//                pageable.getPageNumber() == 0 && pageable.getPageSize() == limit
//        ));
//    }
//
//    @Test
//    void getRecentByAgency_NoData_ShouldReturnEmptyList() {
//        when(transactionHistoryRepo.findRecentByAgencyId(anyLong(), any()))
//                .thenReturn(Collections.emptyList());
//
//        List<TransactionHistoryDto> result = transactionHistoryService.getRecentByAgency(1L, 10);
//
//        assertThat(result).isEmpty();
//    }
//
//
//
//    @Test
//    void getTransactionsByAgency_ShouldParseDateCorrectly() {
//        // GIVEN
//        Long agencyId = 1L;
//        String dateFrom = "2026-04-01";
//        String dateTo = "2026-04-14";
//
//        when(transactionHistoryRepo.findByFilters(eq(agencyId), any(), any(), any(), any(), any()))
//                .thenReturn(Page.empty());
//
//        transactionHistoryService.getTransactionsByAgency(agencyId, 0, 10, dateFrom, dateTo, "Top-up", "Ví");
//
//        ArgumentCaptor<LocalDateTime> fromCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
//        ArgumentCaptor<LocalDateTime> toCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
//
//        verify(transactionHistoryRepo).findByFilters(
//                eq(agencyId), fromCaptor.capture(), toCaptor.capture(), eq("Top-up"), eq("Ví"), any());
//
//        assertThat(fromCaptor.getValue()).isEqualTo(LocalDateTime.of(2026, 4, 1, 0, 0, 0));
//        assertThat(toCaptor.getValue()).isEqualTo(LocalDateTime.of(2026, 4, 14, 23, 59, 59));
//    }
//
//    @Test
//    void getTransactionsByAgency_WithNullOrEmptyDates_ShouldPassNullToRepo() {
//        when(transactionHistoryRepo.findByFilters(any(), any(), any(), any(), any(), any()))
//                .thenReturn(Page.empty());
//
//        transactionHistoryService.getTransactionsByAgency(1L, 0, 10, "", null, null, null);
//
//        verify(transactionHistoryRepo).findByFilters(eq(1L), isNull(), isNull(), isNull(), isNull(), any());
//    }
//
//    @Test
//    void getTransactionsByAgency_VerifySortOrder() {
//        when(transactionHistoryRepo.findByFilters(any(), any(), any(), any(), any(), any()))
//                .thenReturn(Page.empty());
//
//        transactionHistoryService.getTransactionsByAgency(1L, 0, 10, null, null, null, null);
//
//        verify(transactionHistoryRepo).findByFilters(any(), any(), any(), any(), any(), argThat(pageable ->
//                pageable.getSort().getOrderFor("transactionDate").getDirection().isDescending()
//        ));
//    }
//
//    @Test
//    void getTransactionsByAgency_InvalidDateFormat_ShouldThrowException() {
//        String invalidDate = "2026/04/14";
//
//        assertThrows(java.time.format.DateTimeParseException.class, () ->
//                transactionHistoryService.getTransactionsByAgency(1L, 0, 10, invalidDate, null, null, null)
//        );
//    }
//
//    @Test
//    void exportToExcel_Success_ShouldReturnValidStream() throws IOException {
//
//        Long agencyId = 1L;
//        TransactionHistoryDto dto = createMockDto("TRK-XCEL");
//        when(transactionHistoryRepo.findByFiltersWOPageable(any(), any(), any(), any(), any()))
//                .thenReturn(List.of(dto));
//
//        ByteArrayInputStream result = transactionHistoryService.exportToExcel(agencyId, "2026-04-01", "2026-04-14", null, null);
//
//        assertThat(result).isNotNull();
//        assertThat(result.available()).isGreaterThan(0); // Check xem stream có byte nào không
//
//        verify(transactionHistoryRepo).findByFiltersWOPageable(eq(agencyId), any(), any(), isNull(), isNull());
//    }
//
//    @Test
//    void exportToExcel_NoData_ShouldStillReturnHeaderOnlyFile() {
//        when(transactionHistoryRepo.findByFiltersWOPageable(any(), any(), any(), any(), any()))
//                .thenReturn(Collections.emptyList());
//
//
//        ByteArrayInputStream result = transactionHistoryService.exportToExcel(1L, null, null, null, null);
//
//        assertThat(result).isNotNull();
//        assertThat(result.available()).isGreaterThan(0);
//    }
//
//    @Test
//    void exportToExcel_InvalidDate_ShouldThrowException() {
//
//        String invalidDate = "Invalid-Date";
//
//        assertThrows(java.time.format.DateTimeParseException.class, () ->
//                transactionHistoryService.exportToExcel(1L, invalidDate, null, null, null)
//        );
//    }
//
//    @Test
//    void exportToExcel_VerifyContentStructure() throws IOException {
//        // GIVEN
//        when(transactionHistoryRepo.findByFiltersWOPageable(any(), any(), any(), any(), any()))
//                .thenReturn(List.of(createMockDto("CODE-123")));
//
//        ByteArrayInputStream bis = transactionHistoryService.exportToExcel(1L, null, null, null, null);
//
//        org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(bis);
//        org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
//
//        assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Mã GD");
//        assertThat(sheet.getRow(1).getCell(0).getStringCellValue()).isEqualTo("CODE-123");
//
//        workbook.close();
//    }
//
//
//
//    @Test
//    void getSummary_GrowthPositive_ShouldCalculateCorrectly() {
//        Long agencyId = 1L;
//        BigDecimal spendingCurrent = new BigDecimal("150.00");
//        BigDecimal spendingPrev = new BigDecimal("100.00");
//
//        when(transactionHistoryRepo.getTotalSpending(eq(agencyId), anyInt(), anyInt()))
//                .thenReturn(spendingCurrent)
//                .thenReturn(spendingPrev);
//
//        lenient().when(transactionHistoryRepo.getTotalTopup(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//        lenient().when(transactionHistoryRepo.getTotalPenalty(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//
//        // WHEN
//        TransactionSummaryDto result = transactionHistoryService.getSummary(agencyId);
//
//        // THEN
//        assertThat(result.totalSpending()).isEqualByComparingTo("150.00");
//        assertThat(result.spendingGrowth()).isEqualTo(50.0);
//    }
//
//    @Test
//    void getSummary_GrowthNegative_ShouldCalculateCorrectly() {
//        when(transactionHistoryRepo.getTotalSpending(anyLong(), anyInt(), anyInt()))
//                .thenReturn(new BigDecimal("75.00"))
//                .thenReturn(new BigDecimal("100.00"));
//
//        lenient().when(transactionHistoryRepo.getTotalTopup(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//        lenient().when(transactionHistoryRepo.getTotalPenalty(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//
//        // WHEN
//        TransactionSummaryDto result = transactionHistoryService.getSummary(1L);
//
//        // THEN
//        assertThat(result.spendingGrowth()).isEqualTo(-25.0);
//    }
//
//    @Test
//    void getSummary_PrevMonthZeroOrNull_ShouldReturnZeroGrowth() {
//
//        when(transactionHistoryRepo.getTotalTopup(anyLong(), anyInt(), anyInt()))
//                .thenReturn(new BigDecimal("500.00"))
//                .thenReturn(BigDecimal.ZERO);
//
//        lenient().when(transactionHistoryRepo.getTotalSpending(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//        lenient().when(transactionHistoryRepo.getTotalPenalty(anyLong(), anyInt(), anyInt())).thenReturn(BigDecimal.ZERO);
//
//        TransactionSummaryDto result = transactionHistoryService.getSummary(1L);
//
//        assertThat(result.totalTopup()).isEqualByComparingTo("500.00");
//        assertThat(result.topupGrowth()).isEqualTo(0.0);
//    }
//
//    @Test
//    void getSummary_RepositoryReturnsNull_ShouldHandleSafely() {
//        when(transactionHistoryRepo.getTotalSpending(anyLong(), anyInt(), anyInt())).thenReturn(null);
//        when(transactionHistoryRepo.getTotalTopup(anyLong(), anyInt(), anyInt())).thenReturn(null);
//        when(transactionHistoryRepo.getTotalPenalty(anyLong(), anyInt(), anyInt())).thenReturn(null);
//
//        TransactionSummaryDto result = transactionHistoryService.getSummary(1L);
//
//        assertThat(result.totalSpending()).isNull();
//        assertThat(result.spendingGrowth()).isEqualTo(0.0);
//        assertThat(result.topupGrowth()).isEqualTo(0.0);
//        assertThat(result.penaltyGrowth()).isEqualTo(0.0);
//    }
//
//    @Test
//    void getSummary_VerifyCorrectYearMonthCalled() {
//        Long agencyId = 1L;
//        java.time.YearMonth current = java.time.YearMonth.now();
//        java.time.YearMonth prev = current.minusMonths(1);
//
//        transactionHistoryService.getSummary(agencyId);
//
//        verify(transactionHistoryRepo).getTotalSpending(agencyId, current.getYear(), current.getMonthValue());
//        verify(transactionHistoryRepo).getTotalSpending(agencyId, prev.getYear(), prev.getMonthValue());
//    }
//}