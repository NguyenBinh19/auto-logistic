//package com.HTPj.htpj.service.impl;
//
//import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
//import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;
//import com.HTPj.htpj.entity.Booking;
//import com.HTPj.htpj.entity.RoomType;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.RoomTypeRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Nested;
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
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class RevenueReportServiceImplTest {
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @Mock
//    private RoomTypeRepository roomTypeRepository;
//
//    @InjectMocks
//    private RevenueReportServiceImpl revenueReportService;
//
//    private RevenueReportRequest validRequest;
//    private RoomType mockRoomType;
//
//    @BeforeEach
//    void setUp() {
//        validRequest = new RevenueReportRequest();
//        validRequest.setHotelId(101);
//        validRequest.setStartDate(LocalDate.of(2026, 4, 1));
//        validRequest.setEndDate(LocalDate.of(2026, 4, 10)); // 10 ngày
//        validRequest.setGranularity("DAILY");
//
//        mockRoomType = RoomType.builder()
//                .roomTypeId(1)
//                .roomTitle("Deluxe Room")
//                .totalRooms(10)
//                .build();
//    }
//
//    @Nested
//    @DisplayName("Test hàm generateReport")
//    class GenerateReportTest {
//
//        @Test
//        @DisplayName("Case 1: Tạo báo cáo thành công với đầy đủ chỉ số KPI")
//        void generateReport_Success() {
//            // GIVEN
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//
//            // Kỳ hiện tại: 1 booking 200$, 2 đêm (2 room-nights)
//            Booking currentBooking = Booking.builder()
//                    .bookingStatus("COMPLETED")
//                    .checkInDate(LocalDate.of(2026, 4, 1))
//                    .nights(2).totalRooms(1)
//                    .finalAmount(new BigDecimal("200.00")).build();
//
//            // Kỳ trước: 1 booking 100$, 1 đêm (1 room-night)
//            Booking prevBooking = Booking.builder()
//                    .bookingStatus("COMPLETED")
//                    .checkInDate(LocalDate.of(2026, 3, 22))
//                    .nights(1).totalRooms(1)
//                    .finalAmount(new BigDecimal("100.00")).build();
//
//            // Mock 2 lần gọi fetchRevenueBookings (lần 1 hiện tại, lần 2 kỳ trước)
//            when(bookingRepository.findRevenueBookings(eq(101), any(), any(), any()))
//                    .thenReturn(List.of(currentBooking))
//                    .thenReturn(List.of(prevBooking));
//
//            // WHEN
//            RevenueReportResponse response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            assertThat(response).isNotNull();
//            var summary = response.getSummary();
//
//            // Kiểm tra các con số cơ bản
//            assertThat(summary.getTotalRevenue()).isEqualByComparingTo("200.00");
//            assertThat(summary.getTotalRoomNightsSold()).isEqualTo(2);
//
//            // Kiểm tra KPI: Available = 10 phòng * 10 ngày = 100
//            // Occupancy = 2 / 100 * 100 = 2%
//            assertThat(summary.getOccupancyRate()).isEqualTo(2.0);
//
//            // ADR = 200 / 2 = 100
//            assertThat(summary.getAdr()).isEqualByComparingTo("100.00");
//
//            // Kiểm tra tăng trưởng: (200 - 100) / 100 * 100 = 100%
//            assertThat(summary.getRevenueGrowthPercent()).isEqualTo(100.0);
//        }
//
//        @Test
//        @DisplayName("Case 2: Xử lý khi không có dữ liệu booking (vẫn trả về khung báo cáo)")
//        void generateReport_NoData() {
//            // GIVEN
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//            when(bookingRepository.findRevenueBookings(anyInt(), any(), any(), any()))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            RevenueReportResponse response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            assertThat(response.getSummary().getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
//            assertThat(response.getSummary().getOccupancyRate()).isEqualTo(0.0);
//            assertThat(response.getSummary().getRevenueGrowthPercent()).isNull();
//        }
//
//        @Test
//        @DisplayName("Case 3: Lỗi khi ngày bắt đầu sau ngày kết thúc")
//        void generateReport_InvalidDateRange() {
//            // GIVEN
//            validRequest.setStartDate(LocalDate.of(2026, 4, 15));
//            validRequest.setEndDate(LocalDate.of(2026, 4, 1));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> revenueReportService.generateReport(validRequest));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REPORT_INVALID_DATE_RANGE);
//        }
//
//        @Test
//        @DisplayName("Case 4: Lỗi khi xem DAILY nhưng khoảng cách ngày > 365")
//        void generateReport_RangeTooLarge() {
//            // GIVEN
//            validRequest.setStartDate(LocalDate.of(2024, 1, 1));
//            validRequest.setEndDate(LocalDate.of(2025, 1, 2)); // > 365 ngày
//            validRequest.setGranularity("DAILY");
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> revenueReportService.generateReport(validRequest));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REPORT_DATE_RANGE_TOO_LARGE);
//        }
//
//        @Test
//        @DisplayName("Case 5: Sử dụng AgencyId nếu có trong request")
//        void generateReport_WithAgencyId() {
//            // GIVEN
//            validRequest.setAgencyId(500L);
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//
//            // Khi có agencyId, Service sẽ gọi findRevenueBookingsByAgency
//            when(bookingRepository.findRevenueBookingsByAgency(eq(101), any(), any(), any(), eq(500L)))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            revenueReportService.generateReport(validRequest);
//
//            // THEN
//            // Xác nhận repository đúng hàm được gọi
//            // (Mockito verify ngầm định qua việc stubbing phía trên)
//        }
//        @Test
//        @DisplayName("Case 6: Kiểm tra tính toán doanh thu cho NO_SHOW (Nhận đủ 100% tiền)")
//        void generateReport_NoShow_FullRevenue() {
//            // GIVEN
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//            Booking noShowBooking = Booking.builder()
//                    .checkInDate(LocalDate.of(2026, 4, 1))
//                    .bookingStatus("NO_SHOW")
//                    .finalAmount(new BigDecimal("300.00"))
//                    .nights(1).totalRooms(1).build();
//
//            when(bookingRepository.findRevenueBookings(eq(101), any(), any(), any()))
//                    .thenReturn(List.of(noShowBooking))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            var response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            // Status NO_SHOW phải lấy full finalAmount theo logic getEarnedAmount
//            assertThat(response.getSummary().getTotalRevenue()).isEqualByComparingTo("300.00");
//        }
//
//        @Test
//        @DisplayName("Case 7: Tránh lỗi chia cho 0 khi số phòng trống bằng 0")
//        void generateReport_NoAvailableRooms_ZeroDivision() {
//            // GIVEN
//            // Khách sạn không có phòng nào (totalRooms = 0)
//            mockRoomType.setTotalRooms(0);
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//            when(bookingRepository.findRevenueBookings(anyInt(), any(), any(), any()))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            var response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            // Phải trả về 0 chứ không được văng Exception Arithmetic
//            assertThat(response.getSummary().getOccupancyRate()).isEqualTo(0.0);
//            assertThat(response.getSummary().getRevPar()).isEqualByComparingTo(BigDecimal.ZERO);
//        }
//
//        @Test
//        @DisplayName("Case 8: Kiểm tra tính toán doanh thu khi các trường BigDecimal bị null")
//        void generateReport_NullAmounts_ZeroDefault() {
//            // GIVEN
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//            Booking bookingWithNulls = Booking.builder()
//                    .checkInDate(LocalDate.of(2026, 4, 1))
//                    .bookingStatus("COMPLETED")
//                    .finalAmount(null) // Lỗi dữ liệu thực tế thường gặp
//                    .cancellationPenalty(null)
//                    .nights(1).totalRooms(1).build();
//
//            when(bookingRepository.findRevenueBookings(eq(101), any(), any(), any()))
//                    .thenReturn(List.of(bookingWithNulls))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            var response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            // Service phải handle null thành BigDecimal.ZERO
//            assertThat(response.getSummary().getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
//        }
//
//        @Test
//        @DisplayName("Case 9: Kiểm tra tính toán Room Nights khi booking có nhiều phòng")
//        void generateReport_MultipleRoomsPerBooking() {
//            // GIVEN
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//            // 1 booking đặt 3 phòng trong 2 đêm = 6 room-nights
//            Booking multiRoomBooking = Booking.builder()
//                    .checkInDate(LocalDate.of(2026, 4, 1))
//                    .bookingStatus("COMPLETED")
//                    .nights(2)
//                    .totalRooms(3)
//                    .finalAmount(new BigDecimal("600.00")).build();
//
//            when(bookingRepository.findRevenueBookings(eq(101), any(), any(), any()))
//                    .thenReturn(List.of(multiRoomBooking))
//                    .thenReturn(Collections.emptyList());
//
//            // WHEN
//            var response = revenueReportService.generateReport(validRequest);
//
//            // THEN
//            assertThat(response.getSummary().getTotalRoomNightsSold()).isEqualTo(6);
//            // ADR = 600 / 6 = 100
//            assertThat(response.getSummary().getAdr()).isEqualByComparingTo("100.00");
//        }
//    }
//    @Test
//    @DisplayName("Case 10: Kiểm tra trend data với định dạng WEEKLY")
//    void generateReport_WeeklyGranularity() {
//        // GIVEN
//        validRequest.setGranularity("WEEKLY");
//        validRequest.setStartDate(LocalDate.of(2026, 4, 1));
//        validRequest.setEndDate(LocalDate.of(2026, 4, 14)); // 2 tuần
//
//        when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//        when(bookingRepository.findRevenueBookings(anyInt(), any(), any(), any()))
//                .thenReturn(Collections.emptyList());
//
//        // WHEN
//        var response = revenueReportService.generateReport(validRequest);
//
//        // THEN
//        // Tuần chứa ngày 01/04/2026 thường là W14
//        assertThat(response.getTrend().get(0).getPeriod()).contains("-W");
//    }
//    @Test
//    @DisplayName("Case 11: Kiểm tra Occupancy khi có Overbooking (> 100%)")
//    void generateReport_Overbooking_OccupancyOver100() {
//        // GIVEN
//        when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType)); // 10 phòng
//
//        // Giả lập 1 ngày (Available = 10) nhưng bán được 12 phòng
//        validRequest.setStartDate(LocalDate.of(2026, 4, 1));
//        validRequest.setEndDate(LocalDate.of(2026, 4, 1));
//
//        Booking overbooking = Booking.builder()
//                .bookingStatus("COMPLETED")
//                .checkInDate(LocalDate.of(2026, 4, 1))
//                .nights(1).totalRooms(12)
//                .finalAmount(new BigDecimal("1200.00")).build();
//
//        when(bookingRepository.findRevenueBookings(eq(101), any(), any(), any()))
//                .thenReturn(List.of(overbooking))
//                .thenReturn(Collections.emptyList());
//
//        // WHEN
//        var response = revenueReportService.generateReport(validRequest);
//
//        // THEN
//        // 12/10 * 100 = 120%
//        assertThat(response.getSummary().getOccupancyRate()).isEqualTo(120.0);
//    }
//}