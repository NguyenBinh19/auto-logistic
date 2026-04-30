//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.feedback.ReplyFeedbackRequest;
//import com.HTPj.htpj.dto.request.feedback.SubmitFeedbackRequest;
//import com.HTPj.htpj.dto.response.feedback.FeedbackResponse;
//import com.HTPj.htpj.dto.response.feedback.FeedbackStatsResponse;
//import com.HTPj.htpj.entity.*;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.FeedbackServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class FeedbackServiceImplTest {
//
//    @Mock HotelReviewRepository reviewRepository;
//    @Mock BookingRepository bookingRepository;
//    @Mock HotelRepository hotelRepository;
//    @Mock UserRepository userRepository;
//    @Mock AgencyRepository agencyRepository;
//    @Mock PartnerVerificationRepository verificationRepository;
//    @Mock EmailService emailService;
//    @Mock NotificationService notificationService;
//
//    @InjectMocks
//    FeedbackServiceImpl feedbackService;
//
//    @Mock SecurityContext securityContext;
//    @Mock Authentication authentication;
//    @Mock Jwt jwt;
//
//    @BeforeEach
//    void setUp() {
//        SecurityContextHolder.setContext(securityContext);
//    }
//
//    private void mockUser(String userId, String username) {
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.isAuthenticated()).thenReturn(true);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("userId")).thenReturn(userId);
//        lenient().when(authentication.getName()).thenReturn(username);
//    }
//
//    @Test
//    void submitFeedback_Success() {
//        // GIVEN
//        String userId = "user-123";
//        String username = "binh_nguyen";
//        String bookingCode = "BK-2026-001"; // Tránh log bị null
//        mockUser(userId, username);
//
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Dịch vụ tuyệt vời!");
//
//        Booking booking = Booking.builder()
//                .bookingId(1L)
//                .bookingCode(bookingCode) // Thêm dòng này để log/response đẹp
//                .userId(userId)
//                .bookingStatus("COMPLETED")
//                .checkOutDate(LocalDate.now().minusDays(10))
//                .hasFeedback(false)
//                .build();
//
//        Hotel hotel = Hotel.builder()
//                .hotelId(100)
//                .hotelName("Grand Hotel")
//                .build();
//
//        Users user = Users.builder()
//                .id(userId)
//                .username(username)
//                .build();
//
//        Users hotelStaff = Users.builder()
//                .id("staff-1")
//                .username("hotel_staff_01")
//                .build();
//
//        // Mock các Repository
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//        when(hotelRepository.findById(100)).thenReturn(Optional.of(hotel));
//        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
//        when(userRepository.findByHotel_HotelId(100)).thenReturn(List.of(hotelStaff));
//        when(reviewRepository.existsByBookingId(1L)).thenReturn(false);
//
//        // Giả lập lưu Review trả về đối tượng có ID (giúp response.getReviewId() không null)
//        when(reviewRepository.save(any(HotelReview.class))).thenAnswer(invocation -> {
//            HotelReview r = invocation.getArgument(0);
//            r.setReviewId(999); // Giả lập database sinh ID
//            return r;
//        });
//
//        // WHEN
//        FeedbackResponse response = feedbackService.submitFeedback(request);
//
//        // THEN
//        assertThat(response).isNotNull();
//        assertThat(response.getBookingCode()).isEqualTo(bookingCode);
//        assertThat(response.getReviewId()).isEqualTo(999);
//
//        // Kiểm tra xem booking đã được đánh dấu là đã feedback chưa
//        verify(bookingRepository).save(argThat(b -> b.getHasFeedback().equals(true)));
//
//        // Verify lưu review vào DB
//        verify(reviewRepository).save(any(HotelReview.class));
//
//        // Verify gửi thông báo cho nhân viên khách sạn
//        verify(notificationService).sendNotification(
//                eq("staff-1"),
//                eq("FEEDBACK"),
//                contains(bookingCode), // Title chứa mã đặt phòng
//                anyString(),
//                eq("FEEDBACK"),
//                anyString(),
//                anyString()
//        );
//    }
//    @Test
//    void submitFeedback_Fail_Unauthorized() {
//        mockUser("user-A", "name-A");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L,
//                100, 5, 5, 5, "Bad!");
//
//        // Booking thuộc về user-B
//        Booking booking = Booking.builder().bookingId(1L).userId("user-B").build();
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
//    }
//    @Test
//    void submitFeedback_Fail_NotCompleted() {
//        mockUser("u1", "n1");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Ok");
//
//        Booking booking = Booking.builder().bookingId(1L).userId("u1").bookingStatus("CANCELLED").build();
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_COMPLETED);
//    }
//    @Test
//    void submitFeedback_Fail_WindowExpired() {
//        mockUser("u1", "n1");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Late");
//
//        // Check out từ 200 ngày trước
//        Booking booking = Booking.builder()
//                .bookingId(1L).userId("u1").bookingStatus("COMPLETED")
//                .checkOutDate(LocalDate.now().minusDays(200)).build();
//
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.FEEDBACK_WINDOW_EXPIRED);
//    }
//    @Test
//    void submitFeedback_Fail_Duplicate() {
//        mockUser("u1", "n1");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Duplicate");
//
//        Booking booking = Booking.builder().bookingId(1L).userId("u1").bookingStatus("COMPLETED").hasFeedback(true).build();
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.FEEDBACK_ALREADY_SUBMITTED);
//    }
//
//    @Test
//    void submitFeedback_Fail_BookingNotFound() {
//        mockUser("user-123", "binh_nguyen");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(999L, 100, 5, 5, 5, "Nice");
//
//        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_FOUND);
//    }
//
//    @Test
//    void submitFeedback_Fail_HotelNotFound() {
//        mockUser("user-123", "binh_nguyen");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Nice");
//        Booking booking = Booking.builder().bookingId(1L).userId("user-123").bookingStatus("COMPLETED").build();
//
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//        when(hotelRepository.findById(100)).thenReturn(Optional.empty());
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND);
//    }
//
//    @Test
//    void submitFeedback_Fail_ExistsInRepo() {
//        mockUser("u1", "n1");
//        SubmitFeedbackRequest request = new SubmitFeedbackRequest(1L, 100, 5, 5, 5, "Duplicate");
//
//        Booking booking = Booking.builder().bookingId(1L).userId("u1").bookingStatus("COMPLETED").hasFeedback(false).build();
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//        // Giả lập: hasFeedback là false nhưng record trong DB đã tồn tại (lỗi đồng bộ dữ liệu)
//        when(reviewRepository.existsByBookingId(1L)).thenReturn(true);
//
//        AppException ex = assertThrows(AppException.class, () -> feedbackService.submitFeedback(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.FEEDBACK_ALREADY_SUBMITTED);
//    }
//
//    @Test
//    void getMyFeedbackHistory_Success() {
//        // GIVEN
//        String userId = "user-123";
//        String username = "agency_user";
//        // Mock Security Context với key "UserId" (khớp với code implementation của bạn)
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("UserId")).thenReturn(userId);
//
//        Pageable pageable = PageRequest.of(0, 10);
//
//        // Tạo dữ liệu mẫu
//        Hotel hotel = Hotel.builder().hotelId(1).hotelName("Grand Hotel").build();
//        Agency agency = Agency.builder().agencyId(50L).agencyName("Traveloka").build();
//
//        HotelReview review = HotelReview.builder()
//                .reviewId(1)
//                .userId(userId)
//                .bookingId(99L)
//                .hotel(hotel)
//                .agencyId(50L)
//                .comment("Tuyệt vời")
//                .ratingScore(5)
//                .build();
//
//        Booking booking = Booking.builder()
//                .bookingId(99L)
//                .bookingCode("BK-999")
//                .checkInDate(LocalDate.now())
//                .checkOutDate(LocalDate.now().plusDays(1))
//                .build();
//
//        Page<HotelReview> reviewPage = new PageImpl<>(List.of(review));
//
//        // Mock Repository
//        when(reviewRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any(Pageable.class)))
//                .thenReturn(reviewPage);
//        when(bookingRepository.findById(99L)).thenReturn(Optional.of(booking));
//        when(agencyRepository.findById(50L)).thenReturn(Optional.of(agency));
//
//        // WHEN
//        Page<FeedbackResponse> result = feedbackService.getMyFeedbackHistory(pageable);
//
//        // THEN
//        assertThat(result).isNotNull();
//        assertThat(result.getContent()).hasSize(1);
//
//        FeedbackResponse response = result.getContent().get(0);
//        assertThat(response.getBookingCode()).isEqualTo("BK-999");
//        assertThat(response.getHotelName()).isEqualTo("Grand Hotel");
//        assertThat(response.getAgencyName()).isEqualTo("Traveloka");
//
//        verify(reviewRepository).findByUserIdOrderByCreatedAtDesc(eq(userId), eq(pageable));
//        verify(bookingRepository).findById(99L);
//        verify(agencyRepository).findById(50L);
//    }
//
//    @Test
//    void getMyFeedbackHistory_WithNullRelatedIds() {
//        // GIVEN
//        String userId = "user-123";
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("UserId")).thenReturn(userId);
//
//        // Review không có bookingId và agencyId
//        HotelReview review = HotelReview.builder()
//                .reviewId(2)
//                .userId(userId)
//                .bookingId(null) // Cố tình null
//                .agencyId(null)  // Cố tình null
//                .hotel(Hotel.builder().hotelName("Mini Hotel").build())
//                .build();
//
//        Page<HotelReview> reviewPage = new PageImpl<>(List.of(review));
//        when(reviewRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any())).thenReturn(reviewPage);
//
//        // WHEN
//        Page<FeedbackResponse> result = feedbackService.getMyFeedbackHistory(PageRequest.of(0, 5));
//
//        // THEN
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getBookingCode()).isNull();
//
//        // Đảm bảo không gọi vào repo nếu ID null
//        verify(bookingRepository, never()).findById(anyLong());
//        verify(agencyRepository, never()).findById(anyLong());
//    }
//    @Test
//    void getMyFeedbackHistory_Empty() {
//        // GIVEN
//        String userId = "user-empty";
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("UserId")).thenReturn(userId);
//
//        when(reviewRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any()))
//                .thenReturn(Page.empty());
//
//        // WHEN
//        Page<FeedbackResponse> result = feedbackService.getMyFeedbackHistory(PageRequest.of(0, 10));
//
//        // THEN
//        assertThat(result.getContent()).isEmpty();
//        assertThat(result.getTotalElements()).isEqualTo(0);
//    }
//
//    @Test
//    void getHotelFeedback_HandleDifferentNumberTypes() {
//        // GIVEN: Giả lập JWT trả về Long (thay vì Integer)
//        Long hotelIdLong = 100L;
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("hotelId")).thenReturn(hotelIdLong);
//
//        Pageable pageable = PageRequest.of(0, 10);
//        when(reviewRepository.findByHotelId(eq(100), any())).thenReturn(Page.empty());
//
//        // WHEN & THEN: Nếu code không crash và gọi đúng hotelId=100 (Integer) là Pass
//        feedbackService.getHotelFeedback(pageable);
//
//        verify(reviewRepository).findByHotelId(eq(100), any());
//    }
//    private void mockHotelUser(Integer hotelId, String username) {
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.isAuthenticated()).thenReturn(true);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("hotelId")).thenReturn(hotelId);
//        lenient().when(authentication.getName()).thenReturn(username);
//    }
//    @Test
//    void getHotelFeedback_ReviewWithoutHotel() {
//        // GIVEN
//        mockHotelUser(100, "manager");
//
//        // Review bị lỗi dữ liệu, hotel là null
//        HotelReview review = HotelReview.builder()
//                .reviewId(1)
//                .hotel(null) // Case đặc biệt: DB cho phép null hoặc bị lỗi data
//                .build();
//
//        when(reviewRepository.findByHotelId(anyInt(), any())).thenReturn(new PageImpl<>(List.of(review)));
//
//        // WHEN
//        Page<FeedbackResponse> result = feedbackService.getHotelFeedback(PageRequest.of(0, 10));
//
//        // THEN
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getHotelName()).isNull();
//    }
//
//    @Test
//    void getHotelFeedbackStats_Success() {
//        // GIVEN
//        Integer hotelId = 100;
//        mockHotelUser(hotelId, "manager_binh");
//
//        when(reviewRepository.getAvgRating(hotelId)).thenReturn(4.5);
//        when(reviewRepository.getAvgCleanliness(hotelId)).thenReturn(4.0);
//        when(reviewRepository.getAvgService(hotelId)).thenReturn(5.0);
//        when(reviewRepository.countByHotelId(hotelId)).thenReturn(10);
//        when(reviewRepository.countByHotelIdAndStatus(hotelId, "PENDING")).thenReturn(2);
//        when(reviewRepository.countByHotelIdAndStatus(hotelId, "RESPONDED")).thenReturn(8);
//
//        // WHEN
//        FeedbackStatsResponse stats = feedbackService.getHotelFeedbackStats();
//
//        // THEN
//        assertThat(stats).isNotNull();
//        assertThat(stats.getAverageScore()).isEqualTo(4.5);
//        assertThat(stats.getCleanlinessAvg()).isEqualTo(4.0);
//        assertThat(stats.getTotalReviews()).isEqualTo(10L);
//
//        verify(reviewRepository).getAvgRating(hotelId);
//        verify(reviewRepository, times(2)).countByHotelIdAndStatus(eq(hotelId), anyString());
//    }
//
//    @Test
//    void getHotelFeedbackStats_NoReviews() {
//        // GIVEN
//        Integer hotelId = 200;
//        mockHotelUser(hotelId, "new_owner");
//
//        // Khách sạn mới nên các hàm tính trung bình trả về null
//        when(reviewRepository.getAvgRating(hotelId)).thenReturn(null);
//        when(reviewRepository.getAvgCleanliness(hotelId)).thenReturn(null);
//        when(reviewRepository.getAvgService(hotelId)).thenReturn(null);
//        when(reviewRepository.countByHotelId(hotelId)).thenReturn(0);
//        when(reviewRepository.countByHotelIdAndStatus(anyInt(), anyString())).thenReturn(0);
//
//        // WHEN
//        FeedbackStatsResponse stats = feedbackService.getHotelFeedbackStats();
//
//        // THEN
//        assertThat(stats.getAverageScore()).isNull(); // Hoặc 0.0 tùy cách bạn define DTO
//        assertThat(stats.getTotalReviews()).isEqualTo(0L);
//    }
//
//    @Test
//    void getHotelFeedbackStats_Fail_MissingHotelIdInToken() {
//        // GIVEN: Token hợp lệ nhưng không có claim "hotelId"
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("hotelId")).thenReturn(null);
//
//        // WHEN & THEN: Kiểm tra xem có ném đúng NPE khi gọi .intValue() không
//        assertThrows(NullPointerException.class, () -> feedbackService.getHotelFeedbackStats());
//    }
//
//    @Test
//    void replyToFeedback_Success() {
//        // GIVEN
//        Integer hotelId = 100;
//        Integer reviewId = 1;
//        mockHotelUser(hotelId, "binh_manager");
//
//        ReplyFeedbackRequest request = new ReplyFeedbackRequest();
//        request.setReply("Cảm ơn bạn!");
//
//        Hotel hotel = Hotel.builder().hotelId(hotelId).hotelName("Grand Hotel").build();
//        HotelReview review = HotelReview.builder()
//                .reviewId(reviewId).hotel(hotel).userId("agency-123")
//                .status("PENDING").createdAt(LocalDateTime.now().minusDays(5))
//                .build();
//
//        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));
//
//        // WHEN
//        FeedbackResponse response = feedbackService.replyToFeedback(reviewId, request);
//
//        // THEN
//        assertThat(review.getStatus()).isEqualTo("RESPONDED");
//        assertThat(review.getReply()).isEqualTo("Cảm ơn bạn!");
//        verify(reviewRepository).save(review);
//        // Verify gửi thông báo cho Agency
//        verify(notificationService).sendNotification(eq("agency-123"), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void replyToFeedback_Fail_NotYourHotel() {
//        // GIVEN
//        mockHotelUser(100, "manager_A"); // Hotel của tôi là 100
//
//        Hotel otherHotel = Hotel.builder().hotelId(200).build(); // Review thuộc về hotel 200
//        HotelReview review = HotelReview.builder().hotel(otherHotel).build();
//
//        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () ->
//                feedbackService.replyToFeedback(1, new ReplyFeedbackRequest()));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED);
//    }
//
//    @Test
//    void replyToFeedback_Fail_AlreadyResponded() {
//        // GIVEN
//        mockHotelUser(100, "manager");
//        HotelReview review = HotelReview.builder()
//                .hotel(Hotel.builder().hotelId(100).build())
//                .status("RESPONDED").build();
//
//        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () ->
//                feedbackService.replyToFeedback(1, new ReplyFeedbackRequest()));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REVIEW_ALREADY_REPLIED);
//    }
//
//    @Test
//    void replyToFeedback_Fail_Expired() {
//        // GIVEN
//        mockHotelUser(100, "manager");
//        HotelReview review = HotelReview.builder()
//                .hotel(Hotel.builder().hotelId(100).build())
//                .createdAt(LocalDateTime.now().minusDays(31)) // Quá hạn 30 ngày
//                .build();
//
//        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () ->
//                feedbackService.replyToFeedback(1, new ReplyFeedbackRequest()));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REPLY_WINDOW_EXPIRED);
//    }
//
//    @Test
//    void replyToFeedback_Fail_NotFound() {
//        // GIVEN
//        mockHotelUser(100, "manager");
//        when(reviewRepository.findById(99)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () ->
//                feedbackService.replyToFeedback(99, new ReplyFeedbackRequest()));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.REVIEW_NOT_FOUND);
//    }
//    @Test
//    void replyToFeedback_Success_WhenUserIdIsNull() {
//        // GIVEN
//        Integer hotelId = 100;
//        mockHotelUser(hotelId, "manager");
//
//        HotelReview review = HotelReview.builder()
//                .reviewId(1)
//                .hotel(Hotel.builder().hotelId(hotelId).build())
//                .userId(null) // User bị mất ID
//                .status("PENDING")
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        when(reviewRepository.findById(1)).thenReturn(Optional.of(review));
//
//        // WHEN
//        feedbackService.replyToFeedback(1, new ReplyFeedbackRequest("Phản hồi không cần notify"));
//
//        // THEN
//        verify(reviewRepository).save(review);
//        // Quan trọng: Đảm bảo không gọi notificationService nếu userId null
//        verify(notificationService, never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//}