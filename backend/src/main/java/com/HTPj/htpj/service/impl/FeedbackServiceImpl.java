package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.feedback.ReplyFeedbackRequest;
import com.HTPj.htpj.dto.request.feedback.SubmitFeedbackRequest;
import com.HTPj.htpj.dto.response.feedback.FeedbackResponse;
import com.HTPj.htpj.dto.response.feedback.FeedbackStatsResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.FeedbackService;
import com.HTPj.htpj.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedbackServiceImpl implements FeedbackService {

    HotelReviewRepository reviewRepository;
    BookingRepository bookingRepository;
    HotelRepository hotelRepository;
    AgencyRepository agencyRepository;
    UserRepository userRepository;
    PartnerVerificationRepository verificationRepository;
    EmailService emailService;
    NotificationService notificationService;

    private static final int FEEDBACK_WINDOW_DAYS = 180;
    private static final int REPLY_WINDOW_DAYS = 30;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ======================================================================
    // UC-032: Submit feedback
    // ======================================================================
    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('AGENCY_MANAGER', 'AGENCY_STAFF')")
    public FeedbackResponse submitFeedback(SubmitFeedbackRequest request) {
        String userId = getCurrentUserId();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Only the booking owner can submit feedback
        if (!booking.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // PRE-1: Booking must be COMPLETED (COMPLETED)
        if (!"COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_COMPLETED);
        }

        // BR-FB-02: No duplicate feedback
        if (Boolean.TRUE.equals(booking.getHasFeedback()) || reviewRepository.existsByBookingId(booking.getBookingId())) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_SUBMITTED);
        }

        // BR-FB-03: Within review window (180 days after checkout)
        LocalDate checkOutDate = booking.getCheckOutDate();
        if (checkOutDate != null && LocalDate.now().isAfter(checkOutDate.plusDays(FEEDBACK_WINDOW_DAYS))) {
            throw new AppException(ErrorCode.FEEDBACK_WINDOW_EXPIRED);
        }

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        Users user = userRepository.findByUsername(getCurrentUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        HotelReview review = HotelReview.builder()
                .hotel(hotel)
                .bookingId(booking.getBookingId())
                .agencyId(booking.getAgencyId())
                .userId(userId)
                .reviewerName(user.getUsername())
                .ratingScore(request.getOverall())
                .cleanlinessScore(request.getCleanliness())
                .serviceScore(request.getService())
                .comment(request.getComment())
                .build();

        reviewRepository.save(review);

        // Mark booking as having feedback
        booking.setHasFeedback(true);
        bookingRepository.save(booking);

        // POST-3: Notify Hotel Owner via email
        notifyHotelOwner(hotel, booking, user, request.getOverall());

        // Notify hotel via in-app notification
        List<Users> hotelUsers = userRepository.findByHotel_HotelId(hotel.getHotelId());
        for (Users hotelUser : hotelUsers) {
            notificationService.sendNotification(
                    hotelUser.getId(), "FEEDBACK",
                    "Đánh giá mới từ đặt phòng #" + booking.getBookingCode(),
                    "Khách hàng đã gửi đánh giá " + request.getOverall() + " sao cho khách sạn của bạn.",
                    "FEEDBACK", String.valueOf(review.getReviewId()),
                    "/hotel/reviews"
            );
        }

        log.info("Feedback submitted for booking {} by user {}", booking.getBookingCode(), userId);

        return toResponse(review, booking, hotel, null);
    }

    // ======================================================================
    // UC-033: Agency feedback history
    // ======================================================================
    @Override
    @PreAuthorize("hasAnyRole('AGENCY_MANAGER', 'AGENCY_STAFF')")
    public Page<FeedbackResponse> getMyFeedbackHistory(Pageable pageable) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getClaim("userId");
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(review -> {
                    Booking booking = review.getBookingId() != null
                            ? bookingRepository.findById(review.getBookingId()).orElse(null)
                            : null;
                    Hotel hotel = review.getHotel();
                    Agency agency = review.getAgencyId() != null
                            ? agencyRepository.findById(review.getAgencyId()).orElse(null)
                            : null;
                    return toResponse(review, booking, hotel, agency);
                });
    }

    // ======================================================================
    // UC-055: Hotel's received feedback
    // ======================================================================
    @Override
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'HOTEL_STAFF')")
    public Page<FeedbackResponse> getHotelFeedback(Pageable pageable) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        Number hotelIdNum = jwt.getClaim("hotelId");
        Integer hotelId = hotelIdNum.intValue();
//        Integer hotelId = getCurrentUserHotelId();
        return reviewRepository.findByHotelId(hotelId, pageable)
                .map(review -> {
                    Booking booking = review.getBookingId() != null
                            ? bookingRepository.findById(review.getBookingId()).orElse(null)
                            : null;
                    Agency agency = review.getAgencyId() != null
                            ? agencyRepository.findById(review.getAgencyId()).orElse(null)
                            : null;
                    return toResponse(review, booking, review.getHotel(), agency);
                });
    }

    // ======================================================================
    // UC-055: Hotel feedback stats
    // ======================================================================
    @Override
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'HOTEL_STAFF')")
    public FeedbackStatsResponse getHotelFeedbackStats() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        Number hotelIdNum = jwt.getClaim("hotelId");
        Integer hotelId = hotelIdNum.intValue();
//        Integer hotelId = getCurrentUserHotelId();

        return FeedbackStatsResponse.builder()
                .averageScore(reviewRepository.getAvgRating(hotelId))
                .cleanlinessAvg(reviewRepository.getAvgCleanliness(hotelId))
                .serviceAvg(reviewRepository.getAvgService(hotelId))
                .totalReviews(reviewRepository.countByHotelId(hotelId))
                .pendingCount(reviewRepository.countByHotelIdAndStatus(hotelId, "PENDING"))
                .respondedCount(reviewRepository.countByHotelIdAndStatus(hotelId, "RESPONDED"))
                .build();
    }

    // ======================================================================
    // UC-055: Hotel reply to feedback
    // ======================================================================
    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('HOTEL_MANAGER', 'HOTEL_STAFF')")
    public FeedbackResponse replyToFeedback(Integer reviewId, ReplyFeedbackRequest request) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        Number hotelIdNum = jwt.getClaim("hotelId");
        Integer hotelId = hotelIdNum.intValue();
//        Integer hotelId = getCurrentUserHotelId();

        HotelReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Ensure review belongs to this hotel
        if (!review.getHotel().getHotelId().equals(hotelId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if already replied
        if ("RESPONDED".equals(review.getStatus())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_REPLIED);
        }

        // UC055.E1: Reply window (30 days)
        if (review.getCreatedAt() != null
                && review.getCreatedAt().plusDays(REPLY_WINDOW_DAYS).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.REPLY_WINDOW_EXPIRED);
        }

        review.setReply(request.getReply());
        review.setReplyDate(LocalDateTime.now());
        review.setReplyBy(getCurrentUsername());
        review.setStatus("RESPONDED");
        reviewRepository.save(review);

        // Notify agency about reply
        if (review.getUserId() != null) {
            notificationService.sendNotification(
                    review.getUserId(), "FEEDBACK",
                    "Phản hồi từ khách sạn",
                    "Khách sạn " + review.getHotel().getHotelName() + " đã phản hồi đánh giá của bạn.",
                    "FEEDBACK", String.valueOf(reviewId),
                    "/agency/feedback-history"
            );
        }

        log.info("Hotel {} replied to review {}", hotelId, reviewId);

        Booking booking = review.getBookingId() != null
                ? bookingRepository.findById(review.getBookingId()).orElse(null)
                : null;
        Agency agency = review.getAgencyId() != null
                ? agencyRepository.findById(review.getAgencyId()).orElse(null)
                : null;

        return toResponse(review, booking, review.getHotel(), agency);
    }

    // ======================================================================
    // Helpers
    // ======================================================================
    private void notifyHotelOwner(Hotel hotel, Booking booking, Users reviewer, int ratingScore) {
        try {
            verificationRepository.findTopByHotel_HotelIdOrderByVersionDesc(hotel.getHotelId())
                    .ifPresent(pv -> {
                        userRepository.findByUsername(pv.getSubmittedBy()).ifPresent(owner -> {
                            if (owner.getEmail() != null) {
                                emailService.sendNewReviewNotification(
                                        owner.getEmail(),
                                        hotel.getHotelName(),
                                        reviewer.getUsername(),
                                        ratingScore,
                                        booking.getBookingCode()
                                );
                            }
                        });
                    });
        } catch (Exception e) {
            log.warn("Failed to send review notification for hotel {}: {}", hotel.getHotelId(), e.getMessage());
        }
    }

    private FeedbackResponse toResponse(HotelReview review, Booking booking, Hotel hotel, Agency agency) {
        String stayDates = null;
        String bookingCode = null;
        if (booking != null) {
            stayDates = formatDate(booking.getCheckInDate()) + " - " + formatDate(booking.getCheckOutDate());
            bookingCode = booking.getBookingCode();
        }

        return FeedbackResponse.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBookingId())
                .bookingCode(bookingCode)
                .hotelId(hotel != null ? hotel.getHotelId() : null)
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .agencyId(review.getAgencyId())
                .agencyName(agency != null ? agency.getAgencyName() : null)
                .reviewerName(review.getReviewerName())
                .stayDates(stayDates)
                .ratingScore(review.getRatingScore())
                .cleanlinessScore(review.getCleanlinessScore())
                .serviceScore(review.getServiceScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .reply(review.getReply())
                .replyDate(review.getReplyDate())
                .replyBy(review.getReplyBy())
                .status(review.getStatus())
                .build();
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FMT) : "";
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getCurrentUserId() {
        var context = SecurityContextHolder.getContext();
        var authentication = context.getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            String userId = jwt.getClaim("userId");

            if (userId == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return userId;
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    private Integer getCurrentUserHotelId() {
        String userId = getCurrentUserId();
        PartnerVerification pv = verificationRepository
                .findTopBySubmittedByOrderByVersionDesc(userId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        return pv.getHotel().getHotelId();
    }
}
