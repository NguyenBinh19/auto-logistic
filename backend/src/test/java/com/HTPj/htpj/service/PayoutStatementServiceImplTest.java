//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.financial.ConfirmPayoutRequest;
//import com.HTPj.htpj.dto.request.financial.DisputePayoutRequest;
//import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
//import com.HTPj.htpj.dto.request.financial.ResolveDisputeRequest;
//import com.HTPj.htpj.entity.*;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.NotificationService;
//import com.HTPj.htpj.service.impl.PayoutStatementServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Nested;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentMatchers;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class PayoutStatementServiceImplTest {
//
//    @Mock private PayoutStatementRepository statementRepository;
//    @Mock private PayoutLineItemRepository lineItemRepository;
//    @Mock private HotelRepository hotelRepository;
//    @Mock private BookingRepository bookingRepository;
//    @Mock private AgencyRepository agencyRepository;
//    @Mock private UserRepository userRepository;
//    @Mock private NotificationService notificationService;
//    @Mock private EmailService emailService; // Đảm bảo @Mock này có ở class cha
//
//    // Mock cho Security
//    @Mock private Authentication authentication;
//    @Mock private Jwt jwt;
//    @Mock private SecurityContext securityContext;
//    @Mock private PayoutDisputeRepository disputeRepository;
//    @Mock private PayoutDisputeImageRepository disputeImageRepository;
//    @Mock private S3Service s3Service;
//
//    @InjectMocks
//    private PayoutStatementServiceImpl payoutStatementService;
//
//    private Hotel mockHotel;
//    private LocalDate start;
//    private LocalDate end;
//
//    @BeforeEach
//    void setUp() {
//        start = LocalDate.of(2026, 3, 26);
//        end = LocalDate.of(2026, 4, 25);
//
//        mockHotel = Hotel.builder()
//                .hotelId(1)
//                .hotelName("Gemini Hotel")
//                .commissionValue(new BigDecimal("10"))
//                .rateType("PERCENT")
//                .bankName("Vietcombank")
//                .bankAccountNumber("123456789")
//                .bankAccountHolder("NGUYEN BINH")
//                .build();
//    }
//
//    @AfterEach
//    void tearDown() {
//        SecurityContextHolder.clearContext();
//    }
//        @Nested
//        @DisplayName("Test generateStatementsForPeriod - Nhóm Tạo bảng sao kê")
//        class GenerateStatementsTests {
//
//            @Test
//            @DisplayName("Case 1: Thành công - Tính toán đúng Gross, Commission và Net Payout")
//            void generateStatements_Success() {
//                // GIVEN
//                when(bookingRepository.findHotelIdsWithUnprocessedPaidBookings(end)).thenReturn(List.of(1));
//                when(statementRepository.existsByHotelIdAndPeriodStartAndPeriodEnd(anyInt(), any(), any())).thenReturn(false);
//                when(hotelRepository.findById(1)).thenReturn(Optional.of(mockHotel));
//
//                Booking booking = Booking.builder()
//                        .bookingId(101L)
//                        .bookingCode("BK001")
//                        .finalAmount(new BigDecimal("1000.00"))
//                        .nights(2)
//                        .agencyId(1L)
//                        .checkInDate(start)
//                        .build();
//
//                when(bookingRepository.findUnprocessedPaidBookingsByHotel(eq(1), eq(end))).thenReturn(List.of(booking));
//                when(agencyRepository.findById(any())).thenReturn(Optional.of(Agency.builder().agencyName("Agoda").build()));
//                when(statementRepository.save(any(PayoutStatement.class))).thenAnswer(i -> {
//                    PayoutStatement s = i.getArgument(0);
//                    s.setStatementId(1L);
//                    return s;
//                });
//
//                // WHEN
//                var results = payoutStatementService.generateStatementsForPeriod(start, end);
//
//                // THEN
//                assertThat(results).hasSize(1);
//                var statement = results.get(0);
//
//                // Gross = 1000
//                // Commission = 1000 * 10% = 100
//                // Net Payout = 1000 - 100 = 900
//                assertThat(statement.getGrossRevenue()).isEqualByComparingTo("1000.00");
//                assertThat(statement.getTotalCommission()).isEqualByComparingTo("100.00");
//                assertThat(statement.getNetPayout()).isEqualByComparingTo("900.00");
//                assertThat(statement.getStatus()).isEqualTo("PENDING_CONFIRMATION");
//
//                verify(bookingRepository, times(1)).saveAll(anyList()); // Đảm bảo booking được mark là processed
//            }
//
//            @Test
//            @DisplayName("Case 2: Commission loại FIXED - Trừ số tiền cố định mỗi booking")
//            void generateStatements_FixedCommission() {
//                // GIVEN
//                mockHotel.setRateType("FIXED");
//                mockHotel.setCommissionValue(new BigDecimal("50.00")); // 50$ mỗi đơn
//
//                when(bookingRepository.findHotelIdsWithUnprocessedPaidBookings(end)).thenReturn(List.of(1));
//                when(hotelRepository.findById(1)).thenReturn(Optional.of(mockHotel));
//
//                Booking booking = Booking.builder()
//                        .finalAmount(new BigDecimal("1000.00")).nights(1).agencyId(1L).build();
//
//                when(bookingRepository.findUnprocessedPaidBookingsByHotel(1, end)).thenReturn(List.of(booking));
//                when(statementRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//                // WHEN
//                var results = payoutStatementService.generateStatementsForPeriod(start, end);
//
//                // THEN
//                // Net = 1000 - 50 = 950
//                assertThat(results.get(0).getTotalCommission()).isEqualByComparingTo("50.00");
//                assertThat(results.get(0).getNetPayout()).isEqualByComparingTo("950.00");
//            }
//
//            @Test
//            @DisplayName("Case 3: Xử lý ROLLOVER - Khi Net Payout dưới ngưỡng tối thiểu (50$)")
//            void generateStatements_RolloverStatus() {
//                // GIVEN
//                when(bookingRepository.findHotelIdsWithUnprocessedPaidBookings(end)).thenReturn(List.of(1));
//                when(hotelRepository.findById(1)).thenReturn(Optional.of(mockHotel));
//
//                // Booking giá trị thấp: 40$, Commission 10% = 4$ -> Net = 36$ (< 50$)
//                Booking cheapBooking = Booking.builder()
//                        .finalAmount(new BigDecimal("40.00")).nights(1).agencyId(1L).build();
//
//                when(bookingRepository.findUnprocessedPaidBookingsByHotel(1, end)).thenReturn(List.of(cheapBooking));
//                when(statementRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//                // WHEN
//                var results = payoutStatementService.generateStatementsForPeriod(start, end);
//
//                // THEN
//                assertThat(results.get(0).getStatus()).isEqualTo("ROLLOVER");
//            }
//
//            @Test
//            @DisplayName("Case 4: Bỏ qua nếu bảng sao kê đã tồn tại cho kỳ này")
//            void generateStatements_SkipIfAlreadyExists() {
//                // GIVEN
//                when(bookingRepository.findHotelIdsWithUnprocessedPaidBookings(end)).thenReturn(List.of(1));
//                // Giả lập đã tồn tại
//                when(statementRepository.existsByHotelIdAndPeriodStartAndPeriodEnd(1, start, end)).thenReturn(true);
//
//                // WHEN
//                var results = payoutStatementService.generateStatementsForPeriod(start, end);
//
//                // THEN
//                assertThat(results).isEmpty();
//                verify(bookingRepository, never()).findUnprocessedPaidBookingsByHotel(anyInt(), any());
//            }
//
//            @Test
//            @DisplayName("Case 5: Tính toán chính xác khi có Booking hoàn tiền (Refund)")
//            void generateStatements_WithRefunds() {
//                // GIVEN
//                when(bookingRepository.findHotelIdsWithUnprocessedPaidBookings(end)).thenReturn(List.of(1));
//                when(hotelRepository.findById(1)).thenReturn(Optional.of(mockHotel));
//
//                Booking booking = Booking.builder()
//                        .finalAmount(new BigDecimal("1000.00"))
//                        .refundAmount(new BigDecimal("200.00")) // Hoàn tiền 200
//                        .nights(1).agencyId(1L).build();
//
//                when(bookingRepository.findUnprocessedPaidBookingsByHotel(1, end)).thenReturn(List.of(booking));
//                when(statementRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//                // WHEN
//                var results = payoutStatementService.generateStatementsForPeriod(start, end);
//
//                // THEN
//                // Gross = 1000, Comm(10%) = 100, Refund = 200
//                // Net = 1000 - 100 - 200 = 700
//                assertThat(results.get(0).getTotalRefunds()).isEqualByComparingTo("200.00");
//                assertThat(results.get(0).getNetPayout()).isEqualByComparingTo("700.00");
//            }
//        }
//    @Nested
//    @DisplayName("Test confirmPayout - Nhóm Xác nhận đối soát")
//    class ConfirmPayoutTests {
//
//        private ConfirmPayoutRequest confirmRequest;
//
//        @BeforeEach
//        void setUp() {
//            confirmRequest = new ConfirmPayoutRequest();
//            confirmRequest.setStatementId(1L);
//            confirmRequest.setBankName("Vietcombank");
//            confirmRequest.setBankAccountHolder("NGUYEN BINH");
//            confirmRequest.setBankAccountNumber("123456789");
//
//            // --- QUAN TRỌNG: THIẾT LẬP SECURITY CONTEXT TẠI ĐÂY ---
//            // Khởi tạo mock context và gán vào Holder của Spring
//            SecurityContext securityContext = mock(SecurityContext.class);
//            SecurityContextHolder.setContext(securityContext);
//
//            // Thêm lenient() vào trước when
//            lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//            lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//            lenient().when(jwt.getClaim("userId")).thenReturn("user-123");
//        }
//
//        @Test
//        @DisplayName("Case 6: Xác nhận thành công (Vào ngày mùng 4)")
//        void confirmPayout_Success() {
//            LocalDate fixedDate = LocalDate.of(2026, 4, 4);
//
//            try (var mockedLocalDate = mockStatic(LocalDate.class)) {
//                mockedLocalDate.when(LocalDate::now).thenReturn(fixedDate);
//                mockedLocalDate.when(() -> LocalDate.of(anyInt(), anyInt(), anyInt())).thenCallRealMethod();
//
//                PayoutStatement stmt = PayoutStatement.builder()
//                        .statementId(1L)
//                        .status("PENDING_CONFIRMATION")
//                        .hotelId(1).build();
//
//                when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//                when(hotelRepository.findById(1)).thenReturn(Optional.of(mockHotel));
//                // Cần mock thêm userRepository vì confirmPayout thường lấy email để gửi thông báo
//                when(userRepository.findByHotel_HotelId(anyInt())).thenReturn(Collections.emptyList());
//
//                var response = payoutStatementService.confirmPayout(confirmRequest);
//
//                assertThat(response.getStatus()).isEqualTo("APPROVED");
//                assertThat(stmt.getConfirmedBy()).isEqualTo("user-123"); // Kiểm tra user ID đã được lưu
//                verify(statementRepository).save(stmt);
//            }
//        }
//
//        @Test
//        @DisplayName("Case 7: Thất bại - Ngoài khung giờ xác nhận (Mùng 10)")
//        void confirmPayout_OutsideWindow_ThrowsException() {
//            LocalDate outsideDate = LocalDate.of(2026, 4, 10);
//
//            try (var mockedLocalDate = mockStatic(LocalDate.class)) {
//                mockedLocalDate.when(LocalDate::now).thenReturn(outsideDate);
//                mockedLocalDate.when(() -> LocalDate.of(anyInt(), anyInt(), anyInt())).thenCallRealMethod();
//
//                PayoutStatement stmt = PayoutStatement.builder()
//                        .status("PENDING_CONFIRMATION").build();
//                when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//
//                // Chú ý: ErrorCode của bạn có thể là STATEMENT_CONFIRM_WINDOW_CLOSED
//                AppException ex = assertThrows(AppException.class, () -> payoutStatementService.confirmPayout(confirmRequest));
//                assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.STATEMENT_CONFIRM_WINDOW_CLOSED);
//            }
//        }
//
//        @Test
//        @DisplayName("Case 8: Thất bại - Bảng sao kê đã được thanh toán")
//        void confirmPayout_AlreadyPaid_ThrowsException() {
//            // GIVEN
//            PayoutStatement stmt = PayoutStatement.builder()
//                    .status("PAID").build();
//            when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> payoutStatementService.confirmPayout(confirmRequest));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.STATEMENT_ALREADY_PAID);
//        }
//
//        @Test
//        @DisplayName("Case 9: Thất bại - Thiếu thông tin ngân hàng trong request")
//        void confirmPayout_MissingBankInfo_ThrowsException() {
//            // 1. TẠO DỮ LIỆU NGÀY THÁNG TRƯỚC KHI MỞ BLOCK MOCK STATIC
//            LocalDate validDate = LocalDate.of(2026, 4, 4);
//
//            try (var mockedLocalDate = mockStatic(LocalDate.class)) {
//                // 2. CHỈ STUB HÀM NOW() VÀ DÙNG BIẾN ĐÃ TẠO SẴN
//                mockedLocalDate.when(LocalDate::now).thenReturn(validDate);
//
//                // 3. CHO PHÉP CÁC HÀM STATIC KHÁC CHẠY THẬT (PHÒNG HỜ)
//                mockedLocalDate.when(() -> LocalDate.of(anyInt(), anyInt(), anyInt())).thenCallRealMethod();
//
//                // GIVEN
//                PayoutStatement stmt = PayoutStatement.builder()
//                        .status("PENDING_CONFIRMATION").build();
//
//                when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//
//                // Giả lập thiếu thông tin ngân hàng
//                confirmRequest.setBankAccountNumber(null);
//
//                // WHEN & THEN
//                AppException ex = assertThrows(AppException.class, () ->
//                        payoutStatementService.confirmPayout(confirmRequest));
//
//                assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_BANK_INFO);
//            }
//        }
//    }
//    @Nested
//    @DisplayName("Test Nhóm Khiếu nại (Dispute Management)")
//    class DisputeTests {
//
//
//
//        @Test
//        @DisplayName("Case 10: disputePayout - Gửi khiếu nại thành công")
//        void disputePayout_Success() {
//            // 1. GIVEN
//            PayoutStatement stmt = PayoutStatement.builder()
//                    .statementId(1L)
//                    .statementCode("STMT-001")
//                    .status("PENDING_CONFIRMATION")
//                    .hotelId(101).build();
//
//            DisputePayoutRequest request = new DisputePayoutRequest();
//            request.setStatementId(1L);
//            request.setDescription("Sai lệch tiền hoa hồng");
//
//            lenient().when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//            lenient().when(disputeRepository.findByStatement_StatementId(1L)).thenReturn(Optional.empty());
//            lenient().when(hotelRepository.findById(101)).thenReturn(Optional.of(mockHotel));
//
//            // Giả lập User của Hotel (ID là Long trong Database/Entity)
//            Users mockUser = new Users();
//            mockUser.setId(String.valueOf(1001L));
//            lenient().when(userRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockUser));
//
//            // Giả lập Admin (ID là Long trong Database/Entity)
//            Users mockAdmin = new Users();
//            mockAdmin.setId(String.valueOf(1L));
//            lenient().when(userRepository.findByIsAdminTrue()).thenReturn(List.of(mockAdmin));
//
//            // 2. WHEN
//            var response = payoutStatementService.disputePayout(request);
//
//            // 3. THEN
//            assertThat(response.getStatus()).isEqualTo("DISPUTED");
//            verify(disputeRepository).save(any(PayoutDispute.class));
//            verify(statementRepository).save(stmt);
//
//            // KIỂM TRA NOTIFICATION
//            // Vì userId là String, ta dùng eq("1001") và eq("1") hoặc anyString()
//
//            // Kiểm tra gửi cho Hotel User
//            verify(notificationService).sendNotification(
//                    eq("1001"), // Phải là String
//                    eq("FINANCIAL"),
//                    anyString(),
//                    anyString(),
//                    eq("PAYOUT"),
//                    eq("1"), // Statement ID cũng được String.valueOf() trong code của bạn
//                    anyString()
//            );
//
//            // Kiểm tra gửi cho Admin
//            verify(notificationService).sendNotification(
//                    eq("1"), // Phải là String
//                    eq("FINANCIAL"),
//                    anyString(),
//                    anyString(),
//                    eq("PAYOUT"),
//                    eq("1"),
//                    anyString()
//            );
//        }
//
//        @Test
//        @DisplayName("Case 11: disputePayout - Thất bại do đã tồn tại khiếu nại trùng lặp")
//        void disputePayout_AlreadyExists_ThrowsException() {
//            // GIVEN
//            PayoutStatement stmt = PayoutStatement.builder()
//                    .statementId(1L)
//                    .status("PENDING_CONFIRMATION").build();
//
//            when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//            // Giả lập đã tồn tại một khiếu nại trước đó
//            when(disputeRepository.findByStatement_StatementId(1L))
//                    .thenReturn(Optional.of(new PayoutDispute()));
//
//            DisputePayoutRequest request = new DisputePayoutRequest();
//            request.setStatementId(1L);
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () ->
//                    payoutStatementService.disputePayout(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.DISPUTE_ALREADY_EXIST);
//        }
//
//        @Test
//        @DisplayName("Case 12: resolveDispute - Admin giải quyết khiếu nại và upload bằng chứng")
//        void resolveDispute_Success() throws java.io.IOException {
//            // 1. Mock Security cho Admin
//            SecurityContextHolder.setContext(securityContext);
//            lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//            lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//            lenient().when(jwt.getClaim("userId")).thenReturn("admin-user-01");
//
//            // 2. Chuẩn bị dữ liệu
//            ResolveDisputeRequest request = new ResolveDisputeRequest();
//            request.setDisputeId(10L);
//            request.setAdminReport("Đã kiểm tra lại hệ thống, thông tin khiếu nại là chính xác. Đã cập nhật lại số liệu.");
//
//            PayoutDispute dispute = PayoutDispute.builder()
//                    .disputeId(10L)
//                    .status("PENDING")
//                    .statement(new PayoutStatement()) // Link tới statement
//                    .build();
//
//            // Mock MultipartFile (File bằng chứng)
//            org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
//            when(mockFile.isEmpty()).thenReturn(false);
//            when(mockFile.getOriginalFilename()).thenReturn("bank_receipt_proof.jpg");
//            doNothing().when(s3Service).uploadFile(any(), anyString());
//            when(disputeRepository.findById(10L)).thenReturn(Optional.of(dispute));
//
//            // WHEN
//            payoutStatementService.resolveDispute(request, new org.springframework.web.multipart.MultipartFile[]{mockFile});
//
//            // THEN
//            assertThat(dispute.getStatus()).isEqualTo("RESOLVED");
//            assertThat(dispute.getAdminReport()).contains("chính xác");
//            assertThat(dispute.getResolvedBy()).isEqualTo("admin-user-01");
//
//            // Kiểm tra việc tương tác với S3 và Database
//            verify(s3Service).uploadFile(eq(mockFile), anyString());
//            verify(disputeImageRepository).save(any(PayoutDisputeImage.class));
//            verify(disputeRepository).save(dispute);
//        }
//
//        @Test
//        @DisplayName("Case EXTRA: resolveDispute - Thất bại do khiếu nại không tồn tại")
//        void resolveDispute_NotFound_ThrowsException() {
//            // GIVEN
//            ResolveDisputeRequest request = new ResolveDisputeRequest();
//            request.setDisputeId(999L); // Cung cấp ID cụ thể
//
//            when(disputeRepository.findById(999L)).thenReturn(Optional.empty());
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () ->
//                    payoutStatementService.resolveDispute(request, null));
//
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.DISPUTE_NOT_FOUND);
//        }
//    }
//    @Nested
//    @DisplayName("Test Nhóm Thanh toán (Admin Operations)")
//    class AdminPayoutTests {
//        @BeforeEach
//        void setUpSecurity() {
//            SecurityContextHolder.setContext(securityContext);
//            lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//            lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//            lenient().when(jwt.getClaim("userId")).thenReturn("admin-01");
//        }
//
//        @Test
//        @DisplayName("Case 13: markAsPaid - Thành công cho danh sách nhiều bảng sao kê")
//        void markAsPaid_Success() {
//            // 1. GIVEN (Setup Security)
//            SecurityContextHolder.setContext(securityContext);
//            lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//            lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//            lenient().when(jwt.getClaim("userId")).thenReturn("admin-01");
//
//            MarkAsPaidRequest request = new MarkAsPaidRequest();
//            request.setStatementIds(List.of(1L, 2L));
//            request.setBankReference("REF123456");
//
//            PayoutStatement stmt1 = PayoutStatement.builder()
//                    .statementId(1L).status("APPROVED").hotelId(101).statementCode("ST1").build();
//            PayoutStatement stmt2 = PayoutStatement.builder()
//                    .statementId(2L).status("APPROVED").hotelId(101).statementCode("ST2").build();
//
//            when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt1));
//            when(statementRepository.findById(2L)).thenReturn(Optional.of(stmt2));
//
//            mockHotel.setEmail("hotel@example.com");
//            when(hotelRepository.findById(101)).thenReturn(Optional.of(mockHotel));
//
//            // Mock User - Giả sử Users.getId() trả về Long nhưng Service convert sang String
//            Users mockUser = new Users();
//            mockUser.setId(String.valueOf(1001L));
//            when(userRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockUser));
//
//            // 2. WHEN
//            var results = payoutStatementService.markAsPaid(request);
//
//            // 3. THEN
//            assertThat(results).hasSize(2);
//            assertThat(stmt1.getStatus()).isEqualTo("PAID");
//            verify(statementRepository, times(2)).save(any(PayoutStatement.class));
//
//            // ĐÚNG: Dùng eq("1001") nếu Service gọi String.valueOf(u.getId())
//            verify(notificationService, atLeastOnce()).sendNotification(
//                    eq("1001"),
//                    eq("FINANCIAL"),
//                    anyString(), anyString(), anyString(), anyString(), anyString()
//            );
//
//            verify(emailService, times(2)).sendPaymentSentNotification(any(), any(), any(), any(), any());
//        }
//
//        @Test
//        @DisplayName("Case 14: markAsPaid - Thất bại vì có bảng sao kê không ở trạng thái APPROVED")
//        void markAsPaid_InvalidStatus_ThrowsException() {
//            // GIVEN
//            MarkAsPaidRequest request = new MarkAsPaidRequest();
//            request.setStatementIds(List.of(1L));
//
//            PayoutStatement stmt = PayoutStatement.builder()
//                    .statementId(1L)
//                    .status("PENDING_CONFIRMATION").build(); // Status sai
//
//            when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () ->
//                    payoutStatementService.markAsPaid(request));
//
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.STATEMENT_INVALID_STATUS);
//        }
//
//        @Test
//        @DisplayName("Case 15: markAsPaid - Bỏ qua lỗi khi gửi Email (Fail-safe)")
//        void markAsPaid_EmailFailure_StillSucceeds() throws Exception {
//            // ... các phần mock Security giữ nguyên ...
//
//            // GIVEN
//            MarkAsPaidRequest request = new MarkAsPaidRequest();
//            request.setStatementIds(List.of(1L));
//
//            // THÊM DÒNG NÀY:
//            mockHotel.setEmail("partner@hotel.com");
//
//            PayoutStatement stmt = PayoutStatement.builder()
//                    .statementId(1L)
//                    .status("APPROVED")
//                    .hotelId(101)
//                    .statementCode("ST-015")
//                    .netPayout(new BigDecimal("1000")) // Cần nếu code email sử dụng
//                    .build();
//
//            when(statementRepository.findById(1L)).thenReturn(Optional.of(stmt));
//            when(hotelRepository.findById(101)).thenReturn(Optional.of(mockHotel));
//
//            // Giả lập EmailService ném ngoại lệ
//            doThrow(new RuntimeException("SMTP Server down"))
//                    .when(emailService).sendPaymentSentNotification(any(), any(), any(), any(), any());
//
//            // WHEN
//            var results = payoutStatementService.markAsPaid(request);
//
//            // THEN
//            assertThat(results).hasSize(1);
//            assertThat(stmt.getStatus()).isEqualTo("PAID");
//
//            // Lúc này verify sẽ thành công vì email không còn null
//            verify(emailService).sendPaymentSentNotification(any(), any(), any(), any(), any());
//        }
//    }
//    }