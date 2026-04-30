package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.*;
import com.HTPj.htpj.dto.response.financial.*;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.PayoutStatementService;
import com.HTPj.htpj.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutStatementServiceImpl implements PayoutStatementService {

    private final PayoutStatementRepository statementRepository;
    private final PayoutLineItemRepository lineItemRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final AgencyRepository agencyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private static final BigDecimal MIN_PAYOUT_THRESHOLD = new BigDecimal("50");
    private final PayoutDisputeRepository disputeRepository;
    private final S3Service s3Service;
    private final PayoutDisputeImageRepository disputeImageRepository;

    // ---- Statement Generation ----

    @Override
    @Transactional
    public List<PayoutStatementResponse> generateStatementsForPeriod(LocalDate periodStart, LocalDate periodEnd) {
        log.info("Generating payout statements for period {} to {}", periodStart, periodEnd);

        // Hotels with new unprocessed paid bookings this cycle
        List<Integer> hotelIdsWithBookings = bookingRepository.findHotelIdsWithUnprocessedPaidBookings(periodEnd);
        log.info("Found {} hotels with unprocessed paid bookings up to {}", hotelIdsWithBookings.size(), periodEnd);

        // Also include hotels that have a ROLLOVER balance from a previous cycle
        // (they may have no new bookings this month but still deserve a statement)
        List<Integer> hotelIdsWithRollover = statementRepository.findHotelIdsWithRolloverStatements();

        // Merge both lists without duplicates
        Set<Integer> allHotelIds = new LinkedHashSet<>(hotelIdsWithBookings);
        allHotelIds.addAll(hotelIdsWithRollover);

        List<PayoutStatementResponse> results = new ArrayList<>();

        for (Integer hotelId : allHotelIds) {
            // Skip if statement already exists for this hotel and period
            if (statementRepository.existsByHotelIdAndPeriodStartAndPeriodEnd(hotelId, periodStart, periodEnd)) {
                log.info("Statement already exists for hotel {} in period {} - {}, skipping", hotelId, periodStart, periodEnd);
                continue;
            }

            Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
            if (hotel == null) {
                log.warn("Hotel {} not found, skipping", hotelId);
                continue;
            }

            // ---------- 1) Current-cycle bookings ----------
            List<Booking> bookings = bookingRepository.findUnprocessedPaidBookingsByHotel(hotelId, periodEnd);

            // ---------- 2) Carry-forward from ROLLOVER statements ----------
            List<PayoutStatement> rolloverStmts = statementRepository.findRolloverStatementsByHotelId(hotelId);
            BigDecimal carriedForward = rolloverStmts.stream()
                    .map(r -> r.getNetPayout() != null ? r.getNetPayout() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // If neither bookings nor rollover → nothing to do
            if (bookings.isEmpty() && carriedForward.compareTo(BigDecimal.ZERO) == 0) continue;

            // Generate statement code: STM-YYYYMM-hotelId
            String periodCode = periodEnd.format(DateTimeFormatter.ofPattern("yyyyMM"));
            String statementCode = String.format("STM-%s-%04d", periodCode, hotelId);

            // Create statement shell
            PayoutStatement statement = PayoutStatement.builder()
                    .statementCode(statementCode)
                    .hotelId(hotelId)
                    .periodStart(periodStart)
                    .periodEnd(periodEnd)
                    .status("PENDING_CONFIRMATION")
                    .totalBookings(bookings.size())
                    .build();

            statement = statementRepository.save(statement);

            // ---------- 3) Build line items for current-cycle bookings ----------
            BigDecimal grossRevenue = BigDecimal.ZERO;
            BigDecimal totalCommission = BigDecimal.ZERO;
            BigDecimal totalRefunds = BigDecimal.ZERO;
            int totalRoomNights = 0;

            List<PayoutLineItem> lineItems = new ArrayList<>();
            for (Booking booking : bookings) {
                BigDecimal bookingGross = booking.getFinalAmount() != null
                        ? booking.getFinalAmount() : BigDecimal.ZERO;
                BigDecimal bookingRefund = booking.getRefundAmount() != null
                        ? booking.getRefundAmount() : BigDecimal.ZERO;

                BigDecimal commissionAmount = calculateCommission(bookingGross, hotel);
                BigDecimal netAmount = bookingGross.subtract(commissionAmount).subtract(bookingRefund);

                int roomNights = booking.getNights() != null ? booking.getNights() : 0;

                String agencyName = agencyRepository.findById(booking.getAgencyId())
                        .map(Agency::getAgencyName)
                        .orElse("Unknown Agency");

                PayoutLineItem lineItem = PayoutLineItem.builder()
                        .payoutStatement(statement)
                        .bookingId(booking.getBookingId())
                        .bookingCode(booking.getBookingCode())
                        .agencyName(agencyName)
                        .checkInDate(booking.getCheckInDate())
                        .checkOutDate(booking.getCheckOutDate())
                        .roomNights(roomNights)
                        .grossAmount(bookingGross)
                        .commissionAmount(commissionAmount)
                        .refundAmount(bookingRefund)
                        .netAmount(netAmount)
                        .build();

                lineItems.add(lineItem);

                grossRevenue = grossRevenue.add(bookingGross);
                totalCommission = totalCommission.add(commissionAmount);
                totalRefunds = totalRefunds.add(bookingRefund);
                totalRoomNights += roomNights;
            }

            if (!lineItems.isEmpty()) {
                lineItemRepository.saveAll(lineItems);
            }

            // Mark bookings as processed so they won't be picked up again
            for (Booking booking : bookings) {
                booking.setPayoutProcessed(true);
            }
            if (!bookings.isEmpty()) {
                bookingRepository.saveAll(bookings);
            }

            // ---------- 4) Compute final totals (current cycle + carried-forward) ----------
            BigDecimal currentCycleNet = grossRevenue.subtract(totalCommission).subtract(totalRefunds);
            BigDecimal netPayout = currentCycleNet.add(carriedForward);

            statement.setGrossRevenue(grossRevenue);
            statement.setTotalCommission(totalCommission);
            statement.setTotalRefunds(totalRefunds);
            statement.setAdjustments(BigDecimal.ZERO);
            statement.setCarriedForwardAmount(carriedForward);
            statement.setNetPayout(netPayout);
            statement.setTotalRoomNights(totalRoomNights);

            statement.setBankName(hotel.getBankName());
            statement.setBankAccountHolder(hotel.getBankAccountHolder());
            statement.setBankAccountNumber(hotel.getBankAccountNumber());

            // UC-088.E2: Below minimum threshold → ROLLOVER
            if (netPayout.compareTo(MIN_PAYOUT_THRESHOLD) < 0) {
                statement.setStatus("ROLLOVER");
            }

            statementRepository.save(statement);

            // ---------- 5) Mark absorbed ROLLOVER statements as MERGED ----------
            for (PayoutStatement rollover : rolloverStmts) {
                rollover.setStatus("MERGED");
                rollover.setConfirmedBy("SYSTEM_MERGE");
                rollover.setConfirmedAt(LocalDateTime.now());
                statementRepository.save(rollover);
                log.info("Merged ROLLOVER statement {} into new statement {}",
                        rollover.getStatementCode(), statementCode);
            }

            results.add(toResponse(statement, hotel.getHotelName(), false));
            log.info("Generated statement {} for hotel {} ({}): currentCycleNet={}, carriedForward={}, netPayout={}",
                    statementCode, hotelId, hotel.getHotelName(), currentCycleNet, carriedForward, netPayout);

            List<Users> hotelUsers = userRepository.findByHotel_HotelId(hotelId);
            String msgSuffix = carriedForward.compareTo(BigDecimal.ZERO) > 0
                    ? " (bao gồm " + carriedForward.toPlainString() + " VND doanh thu chuyển từ kỳ trước)"
                    : "";
            for (Users u : hotelUsers) {
                notificationService.sendNotification(u.getId(), "FINANCIAL",
                        "Bảng sao kê thanh toán đã được tạo",
                        "Một bảng sao kê thanh toán mới " + statementCode + " đã được tạo cho khách sạn của bạn" + msgSuffix + ".",
                        "PAYOUT", String.valueOf(statement.getStatementId()), "/hotel/payout-state");
            }
        }

        log.info("Generated {} payout statements for period {} to {}", results.size(), periodStart, periodEnd);
        return results;
    }

    @Override
    @Transactional
    public List<PayoutStatementResponse> generateCurrentCycleStatements() {
        LocalDate today = LocalDate.now();
        // Generate for the most recently COMPLETED billing cycle (26th→25th)
        LocalDate periodStart;
        LocalDate periodEnd;

        if (today.getDayOfMonth() >= 26) {
            // After the 26th: last completed cycle ended on the 25th of this month
            periodStart = today.minusMonths(1).withDayOfMonth(26);
            periodEnd = today.withDayOfMonth(25);
        } else {
            // Before the 26th: last completed cycle ended on the 25th of previous month
            periodStart = today.minusMonths(2).withDayOfMonth(26);
            periodEnd = today.minusMonths(1).withDayOfMonth(25);
        }

        return generateStatementsForPeriod(periodStart, periodEnd);
    }

    /**
     * Calculate commission for a booking based on hotel's commission settings.
     * Hotel entity stores commissionValue, commissionType, rateType.
     */
    private BigDecimal calculateCommission(BigDecimal grossAmount, Hotel hotel) {
        if (hotel.getCommissionValue() == null || grossAmount == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal commissionValue = hotel.getCommissionValue();
        String rateType = hotel.getRateType();

        if ("PERCENT".equalsIgnoreCase(rateType)) {
            return grossAmount.multiply(commissionValue)
                    .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
        } else {
            // FIXED amount per booking
            return commissionValue;
        }
    }

    // ---- UC-070: Hotel Owner methods ----

    @Override
    @Transactional(readOnly = true)
    public List<PayoutStatementResponse> getHotelStatements(Integer hotelId) {
        List<PayoutStatement> statements = statementRepository.findByHotelId(hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        return statements.stream()
                .map(s -> toResponse(s, hotel.getHotelName(), false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PayoutStatementResponse getStatementDetail(Long statementId) {
        PayoutStatement stmt = statementRepository.findById(statementId)
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));
        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        List<PayoutLineItem> items = lineItemRepository.findByStatementId(statementId);
        PayoutStatementResponse response = toResponse(stmt, hotel.getHotelName(), true);
        response.setLineItems(items.stream().map(this::toLineItemResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public PayoutStatementResponse confirmPayout(ConfirmPayoutRequest request) {
        PayoutStatement stmt = statementRepository.findById(request.getStatementId())
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

        // BR-FIN-01: Only PENDING_CONFIRMATION can be confirmed
        if (!"PENDING_CONFIRMATION".equals(stmt.getStatus())) {
            if ("PAID".equals(stmt.getStatus())) {
                throw new AppException(ErrorCode.STATEMENT_ALREADY_PAID);
            }
            throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
        }

        // BR-FIN-02: Confirm window is 3rd–5th of the month only
//        int dayOfMonth = LocalDate.now().getDayOfMonth();
//        if (dayOfMonth < 3 || dayOfMonth > 5) {
//            throw new AppException(ErrorCode.STATEMENT_CONFIRM_WINDOW_CLOSED);
//        }

        if (request.getBankName() == null || request.getBankName().isBlank() ||
                request.getBankAccountHolder() == null || request.getBankAccountHolder().isBlank() ||
                request.getBankAccountNumber() == null || request.getBankAccountNumber().isBlank()) {

            throw new AppException(ErrorCode.INVALID_BANK_INFO);
        }

        String userId = getCurrentUserId();

        stmt.setStatus("APPROVED");
        stmt.setConfirmedBy(userId);
        stmt.setConfirmedAt(LocalDateTime.now());
        stmt.setBankName(request.getBankName());
        stmt.setBankAccountHolder(request.getBankAccountHolder());
        stmt.setBankAccountNumber(request.getBankAccountNumber());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        // Notify hotel users: confirm success
        List<Users> hotelUsers = userRepository.findByHotel_HotelId(stmt.getHotelId());
        for (Users u : hotelUsers) {
            notificationService.sendNotification(u.getId(), "FINANCIAL",
                    "Xác nhận đối soát thành công",
                    "Bạn đã xác nhận bảng sao kê " + stmt.getStatementCode()
                            + " thành công. Hệ thống sẽ tiến hành xử lý thanh toán.",
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/hotel/payout-state");
        }

        // Notify admins: a statement has been confirmed
        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "FINANCIAL",
                    "Khách sạn đã xác nhận đối soát",
                    "Bảng sao kê " + stmt.getStatementCode() + " của khách sạn "
                            + hotel.getHotelName() + " đã được xác nhận. Sẵn sàng xử lý thanh toán.",
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/admin/payout-list");
        }
        return toResponse(stmt, hotel.getHotelName(), false);
    }

    @Override
    @Transactional
    public PayoutStatementResponse disputePayout(DisputePayoutRequest request) {
        PayoutStatement stmt = statementRepository.findById(request.getStatementId())
                .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

        if (!"PENDING_CONFIRMATION".equals(stmt.getStatus()) && !"DRAFT".equals(stmt.getStatus())) {
            throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
        }

        disputeRepository.findByStatement_StatementId(stmt.getStatementId())
                .ifPresent(d -> {
                    throw new AppException(ErrorCode.DISPUTE_ALREADY_EXIST);
                });

        PayoutDispute dispute = PayoutDispute.builder()
                .statement(stmt)
                .reasonDetails(request.getDescription())
                .status("PENDING")
                .build();

        disputeRepository.save(dispute);

        stmt.setStatus("DISPUTED");
//        stmt.setDisputeReasonCode(request.getReasonCode());
//        stmt.setDisputeReason(request.getDescription());
        statementRepository.save(stmt);

        Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        // Notify hotel users: dispute received
        List<Users> hotelUsers = userRepository.findByHotel_HotelId(stmt.getHotelId());
        for (Users u : hotelUsers) {
            notificationService.sendNotification(u.getId(), "FINANCIAL",
                    "Khiếu nại đã được ghi nhận",
                    "Khiếu nại của bạn về bảng sao kê " + stmt.getStatementCode()
                            + " đã được ghi nhận. Đội ngũ sẽ xem xét và phản hồi sớm nhất.",
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/hotel/payout-state");
        }

        // Notify admins: dispute raised
        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "FINANCIAL",
                    "Phát sinh khiếu nại thanh toán",
                    "Bảng sao kê " + stmt.getStatementCode() + " của khách sạn " + hotel.getHotelName()
                            + " đã bị khiếu nại.",
                    "PAYOUT", String.valueOf(stmt.getStatementId()), "/admin/payout-list");
        }
        return toResponse(stmt, hotel.getHotelName(), false);
    }

    // ---- UC-088: Admin methods ----

    @Override
    @Transactional(readOnly = true)
    public PayoutListResponse getPayoutList(PayoutListRequest request) {
        List<PayoutStatement> statements = statementRepository.findAll();

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            statements = statements.stream()
                    .filter(s -> request.getStatus().equalsIgnoreCase(s.getStatus()))
                    .collect(Collectors.toList());
        }

        if (request.getPeriodStart() != null && request.getPeriodEnd() != null) {
            statements = statements.stream()
                    .filter(s -> !s.getPeriodStart().isBefore(request.getPeriodStart())
                            && !s.getPeriodEnd().isAfter(request.getPeriodEnd()))
                    .collect(Collectors.toList());
        }

        // Filter by hotelId if specified
        if (request.getHotelId() != null) {
            statements = statements.stream()
                    .filter(s -> s.getHotelId().equals(request.getHotelId()))
                    .collect(Collectors.toList());
        }

        if (!Boolean.TRUE.equals(request.getIncludeDisputed())) {
            statements = statements.stream()
                    .filter(s -> !"DISPUTED".equals(s.getStatus()))
                    .collect(Collectors.toList());
        }

        statements = statements.stream()
                .sorted(Comparator.comparing(PayoutStatement::getPeriodEnd).reversed())
                .collect(Collectors.toList());

        // Batch fetch hotels
        Set<Integer> hotelIds = statements.stream()
                .map(PayoutStatement::getHotelId)
                .collect(Collectors.toSet());
        Map<Integer, Hotel> hotelMap = hotelRepository.findAllById(hotelIds).stream()
                .collect(Collectors.toMap(Hotel::getHotelId, h -> h));

        List<PayoutListItemResponse> payoutItems = new ArrayList<>();
        BigDecimal totalLiability = BigDecimal.ZERO;
        int pendingCount = 0,readyCount = 0, paidCount = 0, blockedCount = 0;

        for (PayoutStatement s : statements) {
            Hotel hotel = hotelMap.get(s.getHotelId());
            String hotelName = hotel != null ? hotel.getHotelName() : "Unknown";

            // UC-088.E1: Missing bank info detection
            boolean missingBankInfo = (hotel == null || s.getBankAccountHolder() == null ||s.getBankAccountNumber() == null||s.getBankName() == null);

            PayoutListItemResponse item = PayoutListItemResponse.builder()
                    .statementId(s.getStatementId())
                    .statementCode(s.getStatementCode())
                    .hotelId(s.getHotelId())
                    .hotelName(hotelName)
                    .periodStart(s.getPeriodStart())
                    .periodEnd(s.getPeriodEnd())
                    .grossRevenue(s.getGrossRevenue())
                    .totalCommission(s.getTotalCommission())
                    .netPayout(s.getNetPayout())
                    .totalBookings(s.getTotalBookings())
                    .carriedForwardAmount(s.getCarriedForwardAmount())
                    .status(s.getStatus())
                    .missingBankInfo(missingBankInfo)
                    .confirmedAt(s.getConfirmedAt())
                    .paidAt(s.getPaidAt())
                    .build();

            payoutItems.add(item);

            // Aggregate summary
            if ("APPROVED".equals(s.getStatus())) {
                totalLiability = totalLiability.add(
                        s.getNetPayout() != null ? s.getNetPayout() : BigDecimal.ZERO);
            }

            switch (s.getStatus()) {
                case "PENDING_CONFIRMATION" -> pendingCount++;
                case "APPROVED" -> readyCount++;
//                case "PROCESSING" -> processingCount++;
                case "PAID" -> paidCount++;
                case "ROLLOVER" -> blockedCount++;
                default -> {}
            }
        }

        return PayoutListResponse.builder()
                .payouts(payoutItems)
                .totalPayoutLiability(totalLiability)
                .totalRecords(statements.size())
                .pendingCount(pendingCount)
                .readyCount(readyCount)
                .paidCount(paidCount)
                .blockedCount(blockedCount)
                .build();
    }

    @Override
    @Transactional
    public List<PayoutStatementResponse> markAsPaid(MarkAsPaidRequest request, MultipartFile proofImage) {
        if (request.getStatementIds() == null || request.getStatementIds().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (request.getBankReference() == null || request.getBankReference().isBlank()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (request.getBankName() == null || request.getBankName().isBlank()
                || request.getBankAccountHolder() == null || request.getBankAccountHolder().isBlank()
                || request.getBankAccountNumber() == null || request.getBankAccountNumber().isBlank()) {
            throw new AppException(ErrorCode.INVALID_BANK_INFO);
        }

        String adminUserId = getCurrentUserId();
        String adminUsername = getCurrentUsername();
        List<PayoutStatementResponse> results = new ArrayList<>();
        String paymentProofKey = uploadPayoutProofIfPresent(proofImage);

        for (Long id : request.getStatementIds()) {
            PayoutStatement stmt = statementRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));

            if (!"APPROVED".equals(stmt.getStatus())) {
                throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
            }

            stmt.setStatus("PAID");
            stmt.setBankReference(request.getBankReference());
            stmt.setBankName(request.getBankName());
            stmt.setBankAccountHolder(request.getBankAccountHolder());
            stmt.setBankAccountNumber(request.getBankAccountNumber());
            stmt.setPaidAt(LocalDateTime.now());
            stmt.setPaidBy((adminUsername != null && !adminUsername.isBlank()) ? adminUsername : adminUserId);
            stmt.setPaymentProofS3Key(paymentProofKey);
            statementRepository.save(stmt);

            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
            results.add(toResponse(stmt, hotel.getHotelName(), false));

            List<Users> hotelUsers = userRepository.findByHotel_HotelId(stmt.getHotelId());
            for (Users u : hotelUsers) {
                notificationService.sendNotification(u.getId(), "FINANCIAL",
                        "Thanh toán đã được chuyển",
                        "Khoản thanh toán cho bảng sao kê " + stmt.getStatementCode() + " đã được chuyển.",
                        "PAYOUT", String.valueOf(stmt.getStatementId()), "/hotel/payout-state");
            }
            // UC-088.2: Send "Payment Sent" email to Hotel
            if (hotel.getEmail() != null && !hotel.getEmail().isBlank()) {
                try {
                    emailService.sendPaymentSentNotification(
                            hotel.getEmail(),
                            hotel.getHotelName(),
                            stmt.getStatementCode(),
                            stmt.getNetPayout(),
                            request.getBankReference()
                    );
                } catch (Exception e) {
                    log.error("Failed to send payment notification for statement {}", stmt.getStatementCode(), e);
                }
            }
        }
        return results;
    }

//    @Override
//    @Transactional
//    public List<PayoutStatementResponse> exportBatchPayment(List<Long> statementIds) {
//        List<PayoutStatementResponse> results = new ArrayList<>();
//
//        for (Long id : statementIds) {
//            PayoutStatement stmt = statementRepository.findById(id)
//                    .orElseThrow(() -> new AppException(ErrorCode.STATEMENT_NOT_FOUND));
//
//            if (!"APPROVED".equals(stmt.getStatus())) {
//                throw new AppException(ErrorCode.STATEMENT_INVALID_STATUS);
//            }
//
//            // UC-088.E2: Below minimum threshold — mark as ROLLOVER
//            if (stmt.getNetPayout() != null
//                    && stmt.getNetPayout().compareTo(MIN_PAYOUT_THRESHOLD) < 0) {
//                stmt.setStatus("ROLLOVER");
//            } else {
//                stmt.setStatus("PROCESSING");
//            }
//            statementRepository.save(stmt);
//
//            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
//                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
//            results.add(toResponse(stmt, hotel.getHotelName(), false));
//        }
//        return results;
//    }

    // ---- Helpers ----

    private PayoutStatementResponse toResponse(PayoutStatement s, String hotelName, boolean includeItems) {
        return PayoutStatementResponse.builder()
                .statementId(s.getStatementId())
                .statementCode(s.getStatementCode())
                .hotelId(s.getHotelId())
                .hotelName(hotelName)
                .periodStart(s.getPeriodStart())
                .periodEnd(s.getPeriodEnd())
                .grossRevenue(s.getGrossRevenue())
                .totalCommission(s.getTotalCommission())
                .totalRefunds(s.getTotalRefunds())
                .adjustments(s.getAdjustments())
                .carriedForwardAmount(s.getCarriedForwardAmount())
                .netPayout(s.getNetPayout())
                .totalBookings(s.getTotalBookings())
                .totalRoomNights(s.getTotalRoomNights())
                .status(s.getStatus())
                .confirmedBy(s.getConfirmedBy())
                .confirmedAt(s.getConfirmedAt())
                .bankName(s.getBankName())
                .bankAccountHolder(s.getBankAccountHolder())
                .bankAccountNumber(s.getBankAccountNumber())
                .bankReference(s.getBankReference())
                .paidBy(s.getPaidBy())
                .paymentProofUrl(getProofUrl(s.getPaymentProofS3Key()))
                .paidAt(s.getPaidAt())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private PayoutLineItemResponse toLineItemResponse(PayoutLineItem item) {
        return PayoutLineItemResponse.builder()
                .lineItemId(item.getLineItemId())
                .bookingId(item.getBookingId())
                .bookingCode(item.getBookingCode())
                .agencyName(item.getAgencyName())
                .checkInDate(item.getCheckInDate())
                .checkOutDate(item.getCheckOutDate())
                .roomNights(item.getRoomNights())
                .grossAmount(item.getGrossAmount())
                .commissionAmount(item.getCommissionAmount())
                .refundAmount(item.getRefundAmount())
                .netAmount(item.getNetAmount())
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }

    private String uploadPayoutProofIfPresent(MultipartFile proofImage) {
        if (proofImage == null || proofImage.isEmpty()) {
            return null;
        }

        String key = "payout/proof/"
                + System.currentTimeMillis() + "_"
                + proofImage.getOriginalFilename();

        try {
            s3Service.uploadFile(proofImage, key);
            return key;
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    private String getProofUrl(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            return null;
        }
        return s3Service.getFileUrl(s3Key);
    }

    @Override
    @Transactional
    public void resolveDispute(ResolveDisputeRequest request, MultipartFile[] files) {

        PayoutDispute dispute = disputeRepository.findById(request.getDisputeId())
                .orElseThrow(() -> new AppException(ErrorCode.DISPUTE_NOT_FOUND));

        if ("RESOLVED".equals(dispute.getStatus())) {
            throw new AppException(ErrorCode.DISPUTE_ALREADY_RESOLVED);
        }

        // update dispute
        dispute.setAdminReport(request.getAdminReport());
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setResolvedBy(getCurrentUserId());
        dispute.setStatus("RESOLVED");

        disputeRepository.save(dispute);

        // upload images
        if (files != null) {
            for (MultipartFile file : files) {

                if (file.isEmpty()) continue;

                String key = "dispute/"
                        + dispute.getDisputeId() + "/"
                        + System.currentTimeMillis() + "_"
                        + file.getOriginalFilename();

                try {
                    s3Service.uploadFile(file, key);
                } catch (IOException e) {
                    throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
                }

                PayoutDisputeImage image = PayoutDisputeImage.builder()
                        .dispute(dispute)
                        .s3Key(key)
                        .build();

                disputeImageRepository.save(image);
            }
        }
    }

    @Override
    public DisputeDetailResponse getDisputeDetail(Long statementId) {

        PayoutDispute dispute = disputeRepository.findByStatement_StatementId(statementId)
                .orElseThrow(() -> new AppException(ErrorCode.DISPUTE_NOT_FOUND));

        DisputeDetailResponse response = new DisputeDetailResponse();

        response.setDisputeId(dispute.getDisputeId());
        response.setReasonDetails(dispute.getReasonDetails());
        response.setAdminReport(dispute.getAdminReport());
        response.setStatus(dispute.getStatus());
        response.setCreatedAt(dispute.getCreatedAt());
        response.setResolvedAt(dispute.getResolvedAt());
        response.setResolvedBy(dispute.getResolvedBy());

        List<String> images = dispute.getImages()
                .stream()
                .map(img -> s3Service.getFileUrl(img.getS3Key()))
                .toList();

        response.setImageUrls(images);

        return response;
    }

    @Override
    public List<PayoutStatementResponse> getDisputedStatements() {

        List<PayoutStatement> statements =
                statementRepository.findByStatuses(List.of("DISPUTED"));

        return statements.stream().map(stmt -> {

            Hotel hotel = hotelRepository.findById(stmt.getHotelId())
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

            return toResponse(stmt, hotel.getHotelName(), false);

        }).toList();
    }
}
