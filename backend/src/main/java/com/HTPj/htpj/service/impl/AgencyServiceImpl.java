package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.CreditSummaryDto;
import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.dto.response.agency.AgencyUserBookingResponse;
import com.HTPj.htpj.dto.response.agency.BookingItemResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.AgencyMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.AgencyService;
import com.HTPj.htpj.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyServiceImpl implements AgencyService {

    private final AgencyRepository agencyRepository;
    private final PartnerVerificationRepository verificationRepository;
    private final AgencyMapper agencyMapper;
    private final UserRepository userRepository;
    private final AgencyBookingRepository agencyBookingRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Override
    public List<AgencyResponse> getAllAgencies() {

        List<Agency> agencies = agencyRepository.findAll();

        return agencies.stream()
                .map(agencyMapper::toAgencyResponse)
                .toList();
    }

    @Override
    public AgencyDetailResponse getAgencyDetail(Long agencyId) {

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        PartnerVerification verification =
                verificationRepository
                        .findVerifiedByAgencyOrderByVersionDesc(agencyId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Verification not found"));

        return agencyMapper.toAgencyDetailResponse(agency, verification);
    }

    @Override
    public AgencyDetailResponse getAgencyDetail() {

        Long agencyId = getCurrentAgencyId();

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        PartnerVerification verification =
                verificationRepository
                        .findVerifiedByAgencyOrderByVersionDesc(agencyId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Verification not found"));

        return agencyMapper.toAgencyDetailResponse(agency, verification);
    }

    @Override
    public AgencyDetailResponse updateAgency(UpdateAgencyRequest request) {
        Long agencyId = getCurrentAgencyId();

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        // check email duplicate
        if (!Objects.equals(agency.getEmail(), request.getEmail())
                && agencyRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        agency.setAgencyName(request.getAgencyName());
        agency.setEmail(request.getEmail());
        agency.setHotline(request.getHotline());
        agency.setContactPhone(request.getContactPhone());

        agency.setUpdatedAt(LocalDateTime.now());

        agencyRepository.save(agency);

        // Notify agency manager about update
        List<Users> managers = userRepository.findByAgency_AgencyId(agencyId);
        for (Users manager : managers) {
            notificationService.sendNotification(
                    manager.getId(), "AGENCY",
                    "Thông tin đại lý đã được cập nhật",
                    "Thông tin của đại lý " + agency.getAgencyName() + " vừa được cập nhật.",
                    "AGENCY", String.valueOf(agencyId),
                    "/agency/agency-profile"
            );
        }

        return getAgencyDetail(agencyId);
    }

    @Override
    public AgencyDetailResponse findAgencyFinanceInfo(Long id) {
        Agency agency = agencyRepository.findAgenciesFinanceInfo(id);

        return AgencyDetailResponse.builder()
                .agencyId(agency.getAgencyId())
                .walletBalance(agency.getWalletBalance())
                .build();
    }

    private Long getCurrentAgencyId() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Agency agency = user.getAgency();

        if (agency == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        return agency.getAgencyId();
    }

    @Override
    public AgencyDetailResponse findAgencyFinanceInfoHeader(Long id) {
        Agency agency = agencyRepository.findAgenciesFinanceInfo(id);

        Integer usedPercent = 0;
        if (agency.getCreditLimit() != null && agency.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
            usedPercent = agency.getCurrentCredit()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(agency.getCreditLimit(), 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        return AgencyDetailResponse.builder()
                .agencyId(agency.getAgencyId())
                .walletBalance(agency.getWalletBalance())
                .creditLimit(agency.getCreditLimit())
                .currentCredit(agency.getCurrentCredit())
                .creditUsedPercent(usedPercent)
                .build();
    }

    @Override
    public CreditSummaryDto getCreditSummary(Long agencyId) {

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        BigDecimal creditLimit = agency.getCreditLimit() != null
                ? agency.getCreditLimit()
                : BigDecimal.ZERO;

        BigDecimal currentCredit = agency.getCurrentCredit() != null
                ? agency.getCurrentCredit()
                : BigDecimal.ZERO;

        BigDecimal remainingCredit = currentCredit;

        List<AgencyBooking> unpaidBookings =
                agencyBookingRepository.findByAgencyIdAndIsPaidFalseAndInUseTrue(agencyId);

        BigDecimal debt = unpaidBookings.stream()
                .map(b -> {
                    BigDecimal principal = b.getPrincipalRemaining() != null
                            ? b.getPrincipalRemaining()
                            : BigDecimal.ZERO;

                    BigDecimal penalty = b.getPenaltyInterest() != null
                            ? b.getPenaltyInterest()
                            : BigDecimal.ZERO;

                    return principal.add(penalty);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int usedPercent = creditLimit.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                debt.multiply(BigDecimal.valueOf(100))
                        .divide(creditLimit, 0, RoundingMode.HALF_UP)
                        .intValue();

        AgencyBooking worstBooking = unpaidBookings.stream()
                .max(Comparator.comparing(
                        b -> b.getLateWorkingDays() != null ? b.getLateWorkingDays() : 0
                ))
                .orElse(null);

        Integer lateDays = 0;
        Integer lateWorkingDays = 0;
        BigDecimal penaltyRate = BigDecimal.ZERO;
        BigDecimal penaltyAmount = unpaidBookings.stream()
                .map(b -> b.getPenaltyInterest() != null ? b.getPenaltyInterest() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String status = "NORMAL";

        if (worstBooking != null) {
            lateDays = worstBooking.getLateDays() != null ? worstBooking.getLateDays() : 0;
            lateWorkingDays = worstBooking.getLateWorkingDays() != null ? worstBooking.getLateWorkingDays() : 0;
            penaltyRate = worstBooking.getPenaltyRate() != null ? worstBooking.getPenaltyRate() : BigDecimal.ZERO;

            if (lateDays > 30) {
                status = "LEGAL";
            } else if (lateWorkingDays > 15) {
                status = "LOCKED";
            } else if (lateWorkingDays > 0) {
                status = "WARNING";
            } else {
                status = "NORMAL";
            }
        }

        LocalDate dueDate = YearMonth.now().atDay(25);

        return new CreditSummaryDto(
                remainingCredit,
                debt,
                creditLimit,
                usedPercent,
                dueDate,
                lateDays,
                lateWorkingDays,
                penaltyRate,
                penaltyAmount,
                status
        );
    }


    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void payDebt(Long agencyId, BigDecimal payment) throws Exception {
        if (payment == null) {
            throw new IllegalArgumentException("Số tiền thanh toán không được null");
        }

        BigDecimal totalAmountUseToPay = payment;

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        List<AgencyBooking> unpaidBookings = agencyBookingRepository.findByAgencyIdAndIsPaidFalseAndInUseTrue(agencyId);

        if (unpaidBookings.isEmpty()) {
            throw new AppException(ErrorCode.NO_DEBT_TO_PAY);
        }

        BigDecimal walletBalance = agency.getWalletBalance() != null ? agency.getWalletBalance() : BigDecimal.ZERO;
        if (walletBalance.compareTo(payment) < 0) {
            throw new AppException(ErrorCode.NOT_ENOUGH_WALLET);
        }

        agency.setWalletBalance(walletBalance.subtract(payment));

        for(AgencyBooking booking : unpaidBookings){
            BigDecimal penalty = booking.getPenaltyInterest() != null ? booking.getPenaltyInterest() : BigDecimal.ZERO;
            BigDecimal principal = booking.getPrincipalRemaining() != null ? booking.getPrincipalRemaining() : BigDecimal.ZERO;

            if (payment.compareTo(penalty) >= 0) {
                payment = payment.subtract(penalty);
                penalty = BigDecimal.ZERO;
            } else {
                penalty = penalty.subtract(payment);
                payment = BigDecimal.ZERO;
            }

            agency.setCurrentCredit(agency.getCurrentCredit() != null
                    ? agency.getCurrentCredit().add(payment)
                    : payment);

            if (payment.compareTo(BigDecimal.ZERO) > 0) {
                if (payment.compareTo(principal) >= 0) {
                    payment = payment.subtract(principal);
                    principal = BigDecimal.ZERO;
                } else {
                    principal = principal.subtract(payment);
                    payment = BigDecimal.ZERO;
                }
            }

            booking.setPenaltyInterest(penalty);
            booking.setPrincipalRemaining(principal);
            booking.setUpdatedAt(LocalDateTime.now());

            if (penalty.compareTo(BigDecimal.ZERO) == 0 && principal.compareTo(BigDecimal.ZERO) == 0) {
                booking.setIsPaid(true);
            }

            agencyBookingRepository.save(booking);

            if (!agencyBookingRepository.findByAgencyIdAndIsPaidFalseAndInUseTrue(agencyId).isEmpty()) {
                agency.setCurrentCredit(agency.getCurrentCredit() != null
                        ? agency.getCurrentCredit().add(payment)
                        : payment);
            }

            agencyRepository.save(agency);

            BigDecimal amountPaid = walletBalance.subtract(agency.getWalletBalance());

            // Notify agency manager about debt payment
            List<Users> managers = userRepository.findByAgency_AgencyId(agencyId);
            for (Users manager : managers) {
                notificationService.sendNotification(
                        manager.getId(), "PAYMENT",
                        "Thanh toán dư nợ thành công",
                        "Đại lý đã thanh toán dư nợ " + amountPaid.toPlainString() + " VND.",
                        "AGENCY", String.valueOf(agencyId),
                        "/agency/credit-wallet"
                );
            }

            agencyBookingRepository.updateStatusForPaidAgency();
        }

        TransactionHistory historyCreditMD = TransactionHistory.builder()
                .transactionDate(LocalDateTime.now())
                .transactionType("Payment")
                .description("Thanh toán dư nợ tín dụng từ ví sang tín dụng")
                .sourceType("Ví")
                .amount(totalAmountUseToPay)
                .balanceAfter(agency.getWalletBalance())
                .status("Success")
                .direction("OUT")
                .agency(agency)
                .createdAt(LocalDateTime.now())
                .build();

        historyCreditMD = transactionHistoryRepository.save(historyCreditMD);
        historyCreditMD.setTransactionCode(String.format("TRK-%06d", historyCreditMD.getId()));
        transactionHistoryRepository.save(historyCreditMD);
    }

    @Override
    public List<AgencyUserBookingResponse> getAgencyUserBookingSummary() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();
        String userId = jwt.getClaim("userId");

        Users currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (currentUser.getAgency() == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        Long agencyId = currentUser.getAgency().getAgencyId();

        // Lấy booking theo agency
        List<Booking> bookings = bookingRepository.findByAgencyId(agencyId);

        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        // Map userId -> Users
        Set<String> userIds = bookings.stream()
                .map(Booking::getUserId)
                .collect(Collectors.toSet());

        Map<String, Users> userMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(Users::getId, u -> u));

        // Group booking theo user
        Map<String, List<Booking>> grouped = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getUserId));

        return grouped.entrySet().stream().map(entry -> {

            String uid = entry.getKey();
            List<Booking> userBookings = entry.getValue();

            Users user = userMap.get(uid);

            BigDecimal totalMoney = BigDecimal.ZERO;

            List<BookingItemResponse> bookingItems = new ArrayList<>();

            for (Booking b : userBookings) {

                BigDecimal refund = b.getRefundAmount() == null
                        ? BigDecimal.ZERO
                        : b.getRefundAmount();

                BigDecimal payment = b.getFinalAmount().subtract(refund);

                totalMoney = totalMoney.add(payment);

                bookingItems.add(
                        BookingItemResponse.builder()
                                .bookingId(b.getBookingId())
                                .bookingStatus(b.getBookingStatus())
                                .paymentAmount(payment)
                                .build()
                );
            }

            return AgencyUserBookingResponse.builder()
                    .userId(uid)
                    .username(user != null ? user.getUsername() : null)
                    .fullName(user != null
                            ? (user.getFirstName() + " " + user.getLastName())
                            : null)
                    .totalBooking(userBookings.size())
                    .totalMoneyUsage(totalMoney)
                    .bookings(bookingItems)
                    .build();

        }).collect(Collectors.toList());
    }
}