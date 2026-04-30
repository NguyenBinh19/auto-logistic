package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.CancelBookingRequest;
import com.HTPj.htpj.dto.request.booking.CheckinRequest;
import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.NoShowRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.booking.UpdateGuestRequest;
import com.HTPj.htpj.dto.response.booking.*;
import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.BookingMapper;
import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.BookingService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final RoomAvailabilityMapper roomAvailabilityMapper;
    private final RoomHoldRepository roomHoldRepository;
    private final RoomPricingRuleRepository roomPricingRuleRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final HotelRepository hotelRepository;
    private final BookingAddonServiceRepository bookingAddonServiceRepository;
    private final PromotionService promotionService;
    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final RoomAllotmentRepository roomAllotmentRepository;
    private final AgencyBookingRevenueRepository agencyBookingRevenueRepository;
    private final AgencyRepository agencyRepository;
    private final AgencyCreditHistoryRepository agencyCreditHistoryRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final AgencyBookingRepository agencyBookingRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final NotificationService notificationService;

    @Override
    public List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request) {

        List<RoomType> roomTypes =
                roomTypeRepository.findByHotel_HotelId(request.getHotelId());

        List<BookingDetail> bookingDetails =
                bookingDetailRepository.findOverlappingBookings(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut(),
                        List.of("BOOKED")
                );

        Map<Integer, Integer> bookedQuantityMap =
                bookingDetails.stream()
                        .collect(Collectors.groupingBy(
                                bd -> bd.getRoomType().getRoomTypeId(),
                                Collectors.summingInt(BookingDetail::getQuantity)
                        ));
        List<RoomHoldDetail> holdDetails =
                roomHoldRepository.findActiveOverlappingHoldDetails(
                        request.getHotelId(),
                        request.getCheckIn(),
                        request.getCheckOut()
                );

        Map<Integer, Integer> holdingQuantityMap =
                holdDetails.stream()
                        .collect(Collectors.groupingBy(
                                RoomHoldDetail::getRoomTypeId,
                                Collectors.summingInt(RoomHoldDetail::getQuantity)
                        ));

        // Fetch allotment data for all room types in the date range
        List<Integer> roomTypeIds = roomTypes.stream()
                .map(RoomType::getRoomTypeId).toList();
        // Allotment covers nights: checkIn to checkOut - 1
        LocalDate allotmentEnd = request.getCheckOut().minusDays(1);
        List<RoomAllotment> allotments = roomAllotmentRepository
                .findByRoomTypeIdsAndDateRange(roomTypeIds, request.getCheckIn(), allotmentEnd);
        Map<Integer, List<RoomAllotment>> allotmentMap = allotments.stream()
                .collect(Collectors.groupingBy(RoomAllotment::getRoomTypeId));

        List<RoomAvailabilityResponse> responses = new ArrayList<>();

        for (RoomType rt : roomTypes) {

            if (!"ACTIVE".equalsIgnoreCase(rt.getRoomStatus())) {
                responses.add(roomAvailabilityMapper.toInactive(rt));
                continue;
            }

            // Determine effective allotment ceiling from allotment records
            List<RoomAllotment> rtAllotments = allotmentMap
                    .getOrDefault(rt.getRoomTypeId(), Collections.emptyList());
            Map<LocalDate, RoomAllotment> rtAllotmentDateMap = rtAllotments.stream()
                    .collect(Collectors.toMap(RoomAllotment::getAllotmentDate, a -> a));

            int effectiveCeiling = rt.getTotalRooms();
            boolean isStopSell = false;
            for (LocalDate date = request.getCheckIn(); !date.isAfter(allotmentEnd); date = date.plusDays(1)) {
                RoomAllotment ra = rtAllotmentDateMap.get(date);
                if (ra != null) {
                    if (Boolean.TRUE.equals(ra.getStopSell())) {
                        isStopSell = true;
                        break;
                    }
                    effectiveCeiling = Math.min(effectiveCeiling, ra.getAllotment());
                }
            }

            int bookedQuantity =
                    bookedQuantityMap.getOrDefault(rt.getRoomTypeId(), 0);

            int holdingQuantity =
                    holdingQuantityMap.getOrDefault(rt.getRoomTypeId(), 0);

            int availableQuantity = isStopSell ? 0 :
                    effectiveCeiling - bookedQuantity - holdingQuantity;

            BigDecimal calculatedPrice = calculateTotalPrice(
                    rt,
                    request.getCheckIn(),
                    request.getCheckOut()
            );

            if (availableQuantity <= 0) {
                responses.add(
                        RoomAvailabilityResponse.builder()
                                .roomTypeId(rt.getRoomTypeId())
                                .roomTitle(rt.getRoomTitle())
                                .price(calculatedPrice)
                                .quantityAvaiable(0)
                                .status(isStopSell ? "stop_sell" : "sold_out")
                                .build()
                );
            } else {
                responses.add(roomAvailabilityMapper.toActive(rt, availableQuantity, calculatedPrice));
            }
        }

        return responses;
    }

    private BigDecimal calculateTotalPrice(RoomType roomType, LocalDate checkIn, LocalDate checkOut) {

        BigDecimal basePrice = roomType.getBasePrice();

        List<RoomPricingRule> rules =
                roomPricingRuleRepository
                        .findByRoomTypeIdAndIsActiveTrue(roomType.getRoomTypeId());

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (LocalDate date = checkIn;
             date.isBefore(checkOut);
             date = date.plusDays(1)) {

            final LocalDate pricingDate = date;
            final String dayOfWeek = pricingDate.getDayOfWeek().name().toLowerCase();

            Optional<RoomPricingRule> selectedRule = rules.stream()
                    .filter(rule -> {

                        boolean matchDateRange = false;
                        boolean matchDayOfWeek = false;

                        if (rule.getStartDate() != null && rule.getEndDate() != null) {
                            matchDateRange =
                                    (!pricingDate.isBefore(rule.getStartDate()) &&
                                            !pricingDate.isAfter(rule.getEndDate()));
                        }

                        if (rule.getDayOfWeek() != null) {
                            matchDayOfWeek = Arrays.stream(rule.getDayOfWeek().split(","))
                                    .map(String::trim)
                                    .anyMatch(d -> d.equalsIgnoreCase(dayOfWeek));

                        }

                        return matchDateRange || matchDayOfWeek;
                    })
                    .min(Comparator.comparing(RoomPricingRule::getPriority));

            BigDecimal dailyPrice = basePrice;

            if (selectedRule.isPresent()) {

                RoomPricingRule rule = selectedRule.get();

//                if (rule.getAdjustmentValue() != null &&
//                        rule.getAdjustmentType() != null) {
//
//                    if ("percent".equalsIgnoreCase(rule.getAdjustmentType())) {
//
//                        BigDecimal percentAmount = basePrice
//                                .multiply(rule.getAdjustmentValue())
//                                .divide(BigDecimal.valueOf(100));
//
//                        dailyPrice = dailyPrice.add(percentAmount);
//                    }
//
//                    if ("fixed".equalsIgnoreCase(rule.getAdjustmentType())) {
//                        dailyPrice = dailyPrice.add(rule.getAdjustmentValue());
//                    }
//                }
                if (rule.getAdjustmentValue() != null && rule.getAdjustmentType() != null) {
                    BigDecimal adjustmentAmount = BigDecimal.ZERO;

                    //Tính toán giá trị điều chỉnh
                    if ("percent".equalsIgnoreCase(rule.getAdjustmentType())) {
                        adjustmentAmount = basePrice
                                .multiply(rule.getAdjustmentValue())
                                .divide(BigDecimal.valueOf(100));
                    } else if ("fixed".equalsIgnoreCase(rule.getAdjustmentType())) {
                        adjustmentAmount = rule.getAdjustmentValue();
                    }

                    // action để cộng (INCREASE) hoặc trừ (DECREASE)
                    if ("DECREASE".equalsIgnoreCase(rule.getAction())) {
                        dailyPrice = dailyPrice.subtract(adjustmentAmount);
                    } else {
                        // Mặc định là INCREASE hoặc các trường hợp khác
                        dailyPrice = dailyPrice.add(adjustmentAmount);
                    }
                }
            }

            totalPrice = totalPrice.add(dailyPrice);
        }

        return totalPrice;
    }

    @Transactional
    @Override
    public CreateBookingResponse createBooking(CreateBookingRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Agency agency = user.getAgency();

        if (agency == null) {
            throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
        }

        Long agencyId = agency.getAgencyId();

        RoomHold hold = roomHoldRepository.findByHoldCode(request.getHoldCode())
                .orElseThrow(() -> new AppException(ErrorCode.HOLD_NOT_FOUND));

        if (!"HOLDING".equalsIgnoreCase(hold.getStatus())) {
            throw new AppException(ErrorCode.HOLD_EXPIRED);
        }

        LocalDate checkIn = hold.getCheckInDate();
        LocalDate checkOut = hold.getCheckOutDate();

        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);

        Booking booking = Booking.builder()
                .bookingCode("BOOKING-" + UUID.randomUUID().toString().substring(0, 8))
                .hotelId(hold.getHotelId())
                .userId(user.getId())
                .agencyId(agencyId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .nights(nights)
                .guestName(request.getGuestName())
                .guestPhone(request.getGuestPhone())
                .guestEmail(request.getGuestEmail())
                .notes(request.getNotes())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDING")
                .bookingStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        BigDecimal bookingTotal = BigDecimal.ZERO;
        int totalRooms = 0;

        List<BookingDetail> bookingDetails = new ArrayList<>();

        for (RoomHoldDetail holdDetail : hold.getDetails()) {

            RoomType roomType = roomTypeRepository.findById(holdDetail.getRoomTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

            int quantity = holdDetail.getQuantity();

            BigDecimal pricePerStay = calculateTotalPrice(roomType, checkIn, checkOut);

            BigDecimal subtotal = pricePerStay;
            BigDecimal total = subtotal.multiply(BigDecimal.valueOf(quantity));

            bookingTotal = bookingTotal.add(total);
            totalRooms += quantity;

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .roomType(roomType)
                    .roomTitle(roomType.getRoomTitle())
                    .quantity(quantity)
                    .pricePerNight(roomType.getBasePrice())
                    .subtotalAmount(subtotal)   // giá 1 phòng
                    .totalAmount(total)         // tổng tiền hạng phòng
                    .checkInDate(checkIn)
                    .checkOutDate(checkOut)
                    .nights(nights)
                    .createdAt(LocalDateTime.now())
                    .roomCode(roomType.getRoomCode())
                    .bedType(roomType.getBedType())
                    .roomArea(roomType.getRoomArea())
                    .maxAdults(roomType.getMaxAdults())
                    .maxChildren(roomType.getMaxChildren())
                    .maxGuests(
                            (roomType.getMaxAdults() == null ? 0 : roomType.getMaxAdults()) +
                                    (roomType.getMaxChildren() == null ? 0 : roomType.getMaxChildren())
                    )
                    .amenities(roomType.getAmenities())
                    .build();

            bookingDetails.add(detail);
        }

        booking.setBookingDetails(bookingDetails);
        booking.setTotalRooms(totalRooms);
        booking.setTotalGuests(request.getTotalGuests());
        booking.setTotalAmount(bookingTotal);

        BigDecimal discountTotal = BigDecimal.ZERO;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {

            CheckPromotionCodeRequest promoRequest =
                    CheckPromotionCodeRequest.builder()
                            .code(request.getPromotionCode())
                            .hotelId(hold.getHotelId())
                            .billAmount(bookingTotal)
                            .checkin(checkIn)
                            .checkout(checkOut)
                            .build();

            ApplyPromotionResponse promo =
                    promotionService.checkPromotionCode(promoRequest);

            booking.setPromotionCode(promo.getCode());
            booking.setDiscountVal(promo.getDiscountVal());
            booking.setTypeDiscount(promo.getTypeDiscount());

            Promotion promotionEntity = promotionRepository.findById(promo.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_CODE_INVALID));

            booking.setPromotion(promotionEntity);

            if ("PERCENT".equalsIgnoreCase(promo.getTypeDiscount())) {

                BigDecimal percentAmount =
                        bookingTotal.multiply(promo.getDiscountVal())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                if (promo.getMaxDiscount() != null &&
                        percentAmount.compareTo(promo.getMaxDiscount()) >= 0) {

                    discountTotal = promo.getMaxDiscount();
                } else {
                    discountTotal = percentAmount;
                }

            } else if ("AMOUNT".equalsIgnoreCase(promo.getTypeDiscount())) {
                discountTotal = promo.getDiscountVal();
            }
        }
        if (discountTotal.compareTo(bookingTotal) > 0) {
            discountTotal = bookingTotal;
        }
        booking.setDiscountTotal(discountTotal);
        booking.setFinalAmount(bookingTotal.subtract(discountTotal));

        BigDecimal finalAmount = booking.getFinalAmount();
        String paymentMethod = request.getPaymentMethod();
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        //check xem phuong thuc thanh toan hop le khong
        if ("CREDIT".equalsIgnoreCase(paymentMethod)) {

            BigDecimal currentCredit = agency.getCurrentCredit();

            if (currentCredit == null || currentCredit.compareTo(finalAmount) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }

        } else if ("WALLET".equalsIgnoreCase(paymentMethod)) {

            BigDecimal walletBalance = agency.getWalletBalance();

            if (walletBalance == null || walletBalance.compareTo(finalAmount) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }

        } else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        Booking saved = bookingRepository.save(booking);

        //count +1
        if (saved.getPromotion() != null) {
            promotionRepository.increaseUsedCount(saved.getPromotion().getId());
        }

        //tru tien, cap nhat vi
        BigDecimal finalAmountPaid = saved.getFinalAmount();

        if ("CREDIT".equalsIgnoreCase(paymentMethod)) {
            BigDecimal creditBefore = agency.getCurrentCredit();
            BigDecimal creditAfter = creditBefore.subtract(finalAmountPaid);

            // save history
            AgencyCreditHistory history = AgencyCreditHistory.builder()
                    .agency(agency)
                    .booking(saved)
                    .creditBefore(creditBefore)
                    .amount(finalAmountPaid)
                    .creditAfter(creditAfter)
                    .type("PAID")
                    .description("Thanh toán hóa đơn " + saved.getBookingCode())
                    .createdAt(LocalDateTime.now())
                    .build();
            agencyCreditHistoryRepository.save(history);

            TransactionHistory historyCreditMD = TransactionHistory.builder()
                    .transactionDate(LocalDateTime.now())
                    .transactionType("Payment")
                    .description("Thanh toán booking " + "(" + saved.getBookingCode() + ")")
                    .sourceType("Credit")
                    .amount(finalAmountPaid)
                    .balanceAfter(creditAfter)
                    .status("Success")
                    .transactionCode("")
                    .direction("OUT")
                    .agency(agency)
                    .createdAt(LocalDateTime.now())
                    .build();
            historyCreditMD = transactionHistoryRepository.save(historyCreditMD);
            historyCreditMD.setTransactionCode(String.format("TRK-%06d", historyCreditMD.getId()));
            transactionHistoryRepository.save(historyCreditMD);

            // update agency
            agency.setCurrentCredit(creditAfter);
            agencyRepository.save(agency);

            YearMonth currentMonth = YearMonth.from(LocalDate.now());
            String monthStr = currentMonth.toString();

            AgencyBooking agencyBooking = agencyBookingRepository
                    .findByAgencyIdAndMonth(agency.getAgencyId(), monthStr)
                    .orElse(AgencyBooking.builder()
                            .agencyId(agency.getAgencyId())
                            .month(monthStr)
                            .totalAmount(BigDecimal.ZERO)
                            .createdAt(LocalDateTime.now())
                            .isPaid(false)
                            .build());

            BigDecimal totalAmount = agencyBooking.getTotalAmount().add(finalAmountPaid);

            agencyBooking.setTotalAmount(
                    totalAmount
            );

            agencyBooking.setPrincipalRemaining(
                    finalAmountPaid.add(agencyBooking.getPrincipalRemaining())
            );

            agencyBooking.setIsPaid(false);

            agencyBooking.setUpdatedAt(LocalDateTime.now());
            agencyBookingRepository.save(agencyBooking);
        } else if ("WALLET".equalsIgnoreCase(paymentMethod)) {

            BigDecimal walletBefore = agency.getWalletBalance();
            BigDecimal walletAfter = walletBefore.subtract(finalAmountPaid);

            agency.setWalletBalance(walletAfter);
            agencyRepository.save(agency);

            TransactionHistory history = TransactionHistory.builder()
                    .transactionDate(LocalDateTime.now())
                    .transactionType("Payment")
                    .description("Thanh toán booking " + "(" + saved.getBookingCode() + ")")
                    .sourceType("Wallet")
                    .amount(finalAmountPaid)
                    .balanceAfter(walletAfter)
                    .status("Success")
                    .direction("OUT")
                    .transactionCode("")
                    .agency(agency)
                    .createdAt(LocalDateTime.now())
                    .build();
            history = transactionHistoryRepository.save(history);
            history.setTransactionCode(String.format("TRK-%06d", history.getId()));
            transactionHistoryRepository.save(history);
        }
        saved.setPaymentStatus("PAID");
        saved.setBookingStatus("BOOKED");
        saved.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(saved);
        hold.setStatus("BOOKED");
        roomHoldRepository.save(hold);

        // Notify hotel about new booking
        List<Users> hotelUsers = userRepository.findByHotel_HotelId(saved.getHotelId());
        for (Users hotelUser : hotelUsers) {
            notificationService.sendNotification(
                    hotelUser.getId(), "BOOKING",
                    "Đặt phòng mới #" + saved.getBookingCode(),
                    "Đơn đặt phòng mới #" + saved.getBookingCode() + " đã được tạo.",
                    "BOOKING", String.valueOf(saved.getBookingId()),
                    "/hotel/view-booking/" + saved.getBookingCode()
            );
        }
        // Notify agency about booking confirmation
        notificationService.sendNotification(
                userId, "BOOKING",
                "Đặt phòng thành công #" + saved.getBookingCode(),
                "Đơn đặt phòng #" + saved.getBookingCode() + " đã được xác nhận.",
                "BOOKING", String.valueOf(saved.getBookingId()),
                "/agency/booking-list/detail/" + saved.getBookingCode()
        );

        return bookingMapper.toResponse(saved);
    }


    // UC-029: Lịch sử đặt phòng (phân trang)
    @Override
    public Page<BookingHistoryResponse> getBookingHistory(int page, int size) {
        String userId = extractUserId();

        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Page<Booking> bookingPage = bookingRepository.findHistoryByUserId(
                user.getId(), PageRequest.of(page, size));

        // Batch-fetch hotel names để tránh N+1 — 1 query duy nhất cho tất cả hotelId
        List<Integer> hotelIds = bookingPage.getContent().stream()
                .map(Booking::getHotelId)
                .distinct()
                .toList();

        Map<Integer, Hotel> hotelMap = hotelRepository.findAllById(hotelIds)
                .stream()
                .collect(Collectors.toMap(Hotel::getHotelId, h -> h));

        return bookingPage.map(booking -> {
            Hotel hotel = hotelMap.get(booking.getHotelId());
            return BookingHistoryResponse.builder()
                    .bookingId(booking.getBookingId())
                    .bookingCode(booking.getBookingCode())
                    .hotelId(booking.getHotelId())
                    .hotelName(hotel != null ? hotel.getHotelName() : null)
                    .checkInDate(booking.getCheckInDate())
                    .checkOutDate(booking.getCheckOutDate())
                    .nights(booking.getNights())
                    .totalRooms(booking.getTotalRooms())
                    .totalGuests(booking.getTotalGuests())
                    .finalAmount(booking.getFinalAmount())
                    .bookingStatus(booking.getBookingStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .guestName(booking.getGuestName())
                    .createdAt(booking.getCreatedAt())
                    .build();
        });
    }


    // UC-030: Chi tiết booking
    @Override
    public BookingDetailResponse getBookingDetail(String bookingCode) {
        String userId = extractUserId();
        Users user = userRepository.findByUsername(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        Booking booking = bookingRepository.findDetailByBookingCodeAndUserId(bookingCode, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Hotel hotel = hotelRepository.findById(booking.getHotelId()).orElse(null);

        List<BookingAddonService> addonServices =
                bookingAddonServiceRepository.findByBookingIdWithService(booking.getBookingId());

        List<BookingDetailItemResponse> roomDetails = booking.getBookingDetails()
                .stream()
                .map(bd -> BookingDetailItemResponse.builder()
                        .bookingDetailId(bd.getBookingDetailId())
                        .roomTitle(bd.getRoomTitle())
                        .quantity(bd.getQuantity())
                        .roomCode(bd.getRoomCode())
                        .bedType(bd.getBedType())
                        .roomArea(bd.getRoomArea())
                        .maxAdults(bd.getMaxAdults())
                        .maxChildren(bd.getMaxChildren())
                        .maxGuests(bd.getMaxGuests())
                        .amenities(bd.getAmenities())
                        .pricePerNight(bd.getPricePerNight())
                        .subtotalAmount(bd.getSubtotalAmount())
                        .totalAmount(bd.getTotalAmount())
                        .nights(bd.getNights())
                        .build())
                .toList();

        List<BookingAddonServiceResponse> addonResponses = addonServices.stream()
                .map(bas -> BookingAddonServiceResponse.builder()
                        .id(bas.getId())
                        .serviceName(bas.getAddonService().getServiceName())
                        .serviceType(bas.getAddonService().getCategory())
                        .quantity(bas.getQuantity())
                        .unitPrice(bas.getUnitPrice())
                        .totalPrice(bas.getTotalPrice())
                        .serviceDate(bas.getServiceDate())
                        .flightNumber(bas.getFlightNumber())
                        .flightTime(bas.getFlightTime())
                        .specialNote(bas.getSpecialNote())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .bookingId(booking.getBookingId())
                .bookingCode(booking.getBookingCode())
                .hotelId(booking.getHotelId())
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .hotelAddress(hotel != null ? hotel.getAddress() : null)
                .hotelStarRating(hotel != null ? hotel.getStarRating() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .totalRooms(booking.getTotalRooms())
                .totalGuests(booking.getTotalGuests())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .guestEmail(booking.getGuestEmail())
                .notes(booking.getNotes())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountTotal())
                .finalAmount(booking.getFinalAmount())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .hasFeedback(Boolean.TRUE.equals(booking.getHasFeedback()))
                .roomDetails(roomDetails)
                .addonServices(addonResponses)
                .build();
    }

    @Override
    public BookingDetailResponse getBookingDetailById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Hotel hotel = hotelRepository.findById(booking.getHotelId()).orElse(null);

        List<BookingAddonService> addonServices =
                bookingAddonServiceRepository.findByBookingIdWithService(booking.getBookingId());

        List<BookingDetailItemResponse> roomDetails = booking.getBookingDetails()
                .stream()
                .map(bd -> BookingDetailItemResponse.builder()
                        .bookingDetailId(bd.getBookingDetailId())
                        .roomTitle(bd.getRoomTitle())
                        .quantity(bd.getQuantity())
                        .roomCode(bd.getRoomCode())
                        .bedType(bd.getBedType())
                        .roomArea(bd.getRoomArea())
                        .maxAdults(bd.getMaxAdults())
                        .maxChildren(bd.getMaxChildren())
                        .maxGuests(bd.getMaxGuests())
                        .amenities(bd.getAmenities())
                        .pricePerNight(bd.getPricePerNight())
                        .subtotalAmount(bd.getSubtotalAmount())
                        .totalAmount(bd.getTotalAmount())
                        .nights(bd.getNights())
                        .build())
                .toList();

        List<BookingAddonServiceResponse> addonResponses = addonServices.stream()
                .map(bas -> BookingAddonServiceResponse.builder()
                        .id(bas.getId())
                        .serviceName(bas.getAddonService() != null ? bas.getAddonService().getServiceName() : null)
                        .serviceType(bas.getAddonService() != null ? bas.getAddonService().getCategory() : null)
                        .quantity(bas.getQuantity())
                        .unitPrice(bas.getUnitPrice())
                        .totalPrice(bas.getTotalPrice())
                        .serviceDate(bas.getServiceDate())
                        .flightNumber(bas.getFlightNumber())
                        .flightTime(bas.getFlightTime())
                        .specialNote(bas.getSpecialNote())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .bookingId(booking.getBookingId())
                .bookingCode(booking.getBookingCode())
                .hotelId(booking.getHotelId())
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .hotelAddress(hotel != null ? hotel.getAddress() : null)
                .hotelStarRating(hotel != null ? hotel.getStarRating() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .totalRooms(booking.getTotalRooms())
                .totalGuests(booking.getTotalGuests())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .guestEmail(booking.getGuestEmail())
                .notes(booking.getNotes())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountTotal())
                .finalAmount(booking.getFinalAmount())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .hasFeedback(Boolean.TRUE.equals(booking.getHasFeedback()))
                .roomDetails(roomDetails)
                .addonServices(addonResponses)
                .build();
    }

    @Override
    public BookingDetailResponse getBookingDetailWithNoUserId(String bookingCode) {

        // Một query: load booking + tất cả bookingDetails (JOIN FETCH)
        Booking booking = bookingRepository.findDetailByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Hotel hotel = hotelRepository.findById(booking.getHotelId()).orElse(null);

        // Một query: load addon services + tên dịch vụ (JOIN FETCH addonService)
        List<BookingAddonService> addonServices =
                bookingAddonServiceRepository.findByBookingIdWithService(booking.getBookingId());

        List<BookingDetailItemResponse> roomDetails = booking.getBookingDetails()
                .stream()
                .map(bd -> BookingDetailItemResponse.builder()
                        .bookingDetailId(bd.getBookingDetailId())
                        .roomTitle(bd.getRoomTitle())
                        .quantity(bd.getQuantity())
                        .roomCode(bd.getRoomCode())
                        .bedType(bd.getBedType())
                        .roomArea(bd.getRoomArea())
                        .maxAdults(bd.getMaxAdults())
                        .maxChildren(bd.getMaxChildren())
                        .maxGuests(bd.getMaxGuests())
                        .amenities(bd.getAmenities())
                        .pricePerNight(bd.getPricePerNight())
                        .subtotalAmount(bd.getSubtotalAmount())
                        .totalAmount(bd.getTotalAmount())
                        .nights(bd.getNights())
                        .build())
                .toList();

        List<BookingAddonServiceResponse> addonResponses = addonServices.stream()
                .map(bas -> BookingAddonServiceResponse.builder()
                        .id(bas.getId())
                        .serviceName(bas.getAddonService().getServiceName())
                        .serviceType(bas.getAddonService().getCategory())
                        .quantity(bas.getQuantity())
                        .unitPrice(bas.getUnitPrice())
                        .totalPrice(bas.getTotalPrice())
                        .serviceDate(bas.getServiceDate())
                        .flightNumber(bas.getFlightNumber())
                        .flightTime(bas.getFlightTime())
                        .specialNote(bas.getSpecialNote())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .bookingId(booking.getBookingId())
                .bookingCode(booking.getBookingCode())
                .hotelId(booking.getHotelId())
                .hotelName(hotel != null ? hotel.getHotelName() : null)
                .hotelAddress(hotel != null ? hotel.getAddress() : null)
                .hotelStarRating(hotel != null ? hotel.getStarRating() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .totalRooms(booking.getTotalRooms())
                .totalGuests(booking.getTotalGuests())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .guestEmail(booking.getGuestEmail())
                .notes(booking.getNotes())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountTotal())
                .finalAmount(booking.getFinalAmount())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .hasFeedback(Boolean.TRUE.equals(booking.getHasFeedback()))
                .roomDetails(roomDetails)
                .addonServices(addonResponses)
                .build();
    }

    // =========================================================================
    // Helpers
    // =========================================================================
    private String extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        return jwt.getSubject();
    }

    //UC79
    @Override
    public List<ListAllBookingsResponse> getAllBookings() {
        return bookingRepository.getAllBookingsSummary();
    }

    public List<ListAllBookingsResponse> getAllBookingsByHotelId(Integer hotelId) {
        return bookingRepository.getAllBookingsSummaryByHotelId(hotelId);
    }
    //UC28:
    @Override
    public BookingDetailResponse updateGuestInformation(UpdateGuestRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        LocalDate currentDate = LocalDate.now();

        if (!"BOOKED".equals(booking.getBookingStatus())
                || !currentDate.isBefore(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.BOOKING_UPDATE_NOT_ALLOWED);
        }

        booking.setGuestName(request.getGuestName());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setNotes(request.getNotes());

        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        return bookingMapper.toBookingDetailResponse(savedBooking);
    }

    //UC-050 - View Daily Arrival List
    @Override
    public List<ListAllBookingsResponse> getTodayCheckinBookings() {
        Integer hotelId = extractHotelId();
        return bookingRepository.getTodayCheckinBookings(hotelId);
    }

    @Override
    public List<ListAllBookingsResponse> getBookingsByCheckinDate(LocalDate date) {
        Integer hotelId = extractHotelId();
        return bookingRepository.getBookingsByCheckinDate(hotelId, date);
    }

    // =========================================================================
    // UC-051: View Daily Departure List
    // =========================================================================
    @Override
    public List<DepartureListResponse> getTodayDepartures() {
        Integer hotelId = extractHotelId();
        return bookingRepository.getTodayDeparturesByHotelId(hotelId);
    }

    @Override
    public List<DepartureListResponse> getDeparturesByDate(LocalDate date) {
        Integer hotelId = extractHotelId();
        return bookingRepository.getDeparturesByHotelIdAndDate(hotelId, date);
    }

    // UC-051: Perform checkout — update booking to COMPLETED
    @Transactional
    @Override
    public BookingDetailResponse performCheckout(String bookingCode) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(bookingCode, hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_COMPLETED);
        }
        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())
                && !"CHECKED-IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_CHECKED_IN);
        }

        booking.setBookingStatus("COMPLETED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        AgencyBookingRevenue revenue = new AgencyBookingRevenue();
        revenue.setAgencyId(booking.getAgencyId());
        revenue.setBookingId(booking.getBookingId());
        revenue.setRevenueAmount(booking.getFinalAmount());
        revenue.setCheckoutDate(booking.getCheckOutDate());
        revenue.setCreatedAt(LocalDateTime.now());

        agencyBookingRevenueRepository.save(revenue);

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // UC-051: Express checkout — instant process, no bill check
    @Transactional
    @Override
    public BookingDetailResponse expressCheckout(String bookingCode) {
        return performCheckout(bookingCode);
    }

    private Integer extractHotelId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();
        Number hotelIdClaim = jwt.getClaim("hotelId");
        return hotelIdClaim.intValue();
    }

    // =========================================================================
    // UC-031: Cancel Booking Order
    // =========================================================================
    @Transactional
    @Override
    public CancelBookingResponse cancelBooking(CancelBookingRequest request) {

        Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Only BOOKED bookings can be cancelled
        String status = booking.getBookingStatus();
        if (!"CONFIRMED".equalsIgnoreCase(status) && !"BOOKED".equalsIgnoreCase(status)) {
            throw new AppException(ErrorCode.CANCEL_NOT_ALLOWED);
        }

        LocalDate today = LocalDate.now();

        // Cannot cancel after check-in date has passed
        if (today.isAfter(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.CANCEL_PAST_CHECKIN);
        }

        // ===== CONFIG 3 MỐC =====
        int fullRefundDays = systemConfigRepository.findByConfigCode("CANCEL_FULL_REFUND_DAYS")
                .map(c -> Integer.parseInt(c.getConfigValue()))
                .orElse(7);

        int penaltyDays = systemConfigRepository.findByConfigCode("CANCEL_PENALTY_DAYS")
                .map(c -> Integer.parseInt(c.getConfigValue()))
                .orElse(3);

// % từng mức
        BigDecimal percentLevel1 = systemConfigRepository.findByConfigCode("CANCEL_LEVEL1_PERCENT")
                .map(c -> new BigDecimal(c.getConfigValue()))
                .orElse(BigDecimal.ZERO); // >= fullRefundDays

        BigDecimal percentLevel2 = systemConfigRepository.findByConfigCode("CANCEL_LEVEL2_PERCENT")
                .map(c -> new BigDecimal(c.getConfigValue()))
                .orElse(BigDecimal.valueOf(50)); // giữa

        BigDecimal percentLevel3 = systemConfigRepository.findByConfigCode("CANCEL_LEVEL3_PERCENT")
                .map(c -> new BigDecimal(c.getConfigValue()))
                .orElse(BigDecimal.valueOf(100)); // < penaltyDays

        // Calculate cancellation penalty
        long daysBeforeCheckin = ChronoUnit.DAYS.between(today, booking.getCheckInDate());

        BigDecimal percent;

        if (daysBeforeCheckin >= fullRefundDays) {
            percent = percentLevel1;

        } else if (daysBeforeCheckin >= penaltyDays) {
            percent = percentLevel2;

        } else {
            percent = percentLevel3;
        }

// penalty = amount * percent / 100
        BigDecimal penalty = booking.getFinalAmount()
                .multiply(percent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal refund = booking.getFinalAmount().subtract(penalty);
        if (refund.compareTo(BigDecimal.ZERO) < 0) {
            refund = BigDecimal.ZERO;
        }

        // Release inventory (decrement soldCount in allotments)
        releaseInventory(booking);

        // Refund to agency based on payment method
        if (refund.compareTo(BigDecimal.ZERO) > 0) {
            Agency agency = agencyRepository.findById(booking.getAgencyId())
                    .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

            String paymentMethod = booking.getPaymentMethod();

            if ("CREDIT".equalsIgnoreCase(paymentMethod)) {
                BigDecimal creditBefore = agency.getCurrentCredit();
                BigDecimal creditAfter = creditBefore.add(refund);

                AgencyCreditHistory history = AgencyCreditHistory.builder()
                        .agency(agency)
                        .booking(booking)
                        .creditBefore(creditBefore)
                        .amount(refund)
                        .creditAfter(creditAfter)
                        .type("REFUND")
                        .description("Hoàn tiền hủy đơn " + booking.getBookingCode())
                        .createdAt(LocalDateTime.now())
                        .build();
                agencyCreditHistoryRepository.save(history);

                // Save credit refund transaction history
                TransactionHistory txHistory = TransactionHistory.builder()
                        .transactionDate(LocalDateTime.now())
                        .transactionType("Refund")
                        .description("Hoàn tiền hủy đơn " + "(" + booking.getBookingCode() + ")")
                        .sourceType("Credit")
                        .amount(refund)
                        .balanceAfter(creditAfter)
                        .status("Success")
                        .transactionCode("")
                        .direction("IN")
                        .agency(agency)
                        .createdAt(LocalDateTime.now())
                        .build();
                txHistory = transactionHistoryRepository.save(txHistory);
                txHistory.setTransactionCode(String.format("TRK-%06d", txHistory.getId()));
                transactionHistoryRepository.save(txHistory);

                agency.setCurrentCredit(creditAfter);
                agencyRepository.save(agency);

            } else if ("WALLET".equalsIgnoreCase(paymentMethod)) {
                BigDecimal walletBefore = agency.getWalletBalance() != null
                        ? agency.getWalletBalance() : BigDecimal.ZERO;
                BigDecimal walletAfter = walletBefore.add(refund);

                agency.setWalletBalance(walletAfter);
                agencyRepository.save(agency);

                // Save wallet refund transaction history
                TransactionHistory txHistory = TransactionHistory.builder()
                        .transactionDate(LocalDateTime.now())
                        .transactionType("Refund")
                        .description("Hoàn tiền hủy đơn " + "(" + booking.getBookingCode() + ")")
                        .sourceType("Wallet")
                        .amount(refund)
                        .balanceAfter(walletAfter)
                        .status("Success")
                        .transactionCode("")
                        .direction("IN")
                        .agency(agency)
                        .createdAt(LocalDateTime.now())
                        .build();
                txHistory = transactionHistoryRepository.save(txHistory);
                txHistory.setTransactionCode(String.format("TRK-%06d", txHistory.getId()));
                transactionHistoryRepository.save(txHistory);
            }
        }

        booking.setCancellationPenalty(penalty);
        booking.setRefundAmount(refund);
        booking.setBookingStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify hotel about cancellation
        List<Users> hotelUsers = userRepository.findByHotel_HotelId(booking.getHotelId());
        for (Users hotelUser : hotelUsers) {
            notificationService.sendNotification(
                    hotelUser.getId(), "BOOKING",
                    "Hủy đặt phòng #" + booking.getBookingCode(),
                    "Đơn đặt phòng #" + booking.getBookingCode() + " đã bị hủy.",
                    "BOOKING", String.valueOf(booking.getBookingId()),
                    "/hotel/view-booking/" + booking.getBookingCode()
            );
        }
        // Notify agency user
        notificationService.sendNotification(
                booking.getUserId(), "BOOKING",
                "Hủy đặt phòng #" + booking.getBookingCode(),
                "Đơn đặt phòng #" + booking.getBookingCode() + " đã bị hủy. Hoàn tiền: " + refund.toPlainString() + " VND.",
                "BOOKING", String.valueOf(booking.getBookingId()),
                "/agency/booking-list/detail/" + booking.getBookingCode()
        );

        return CancelBookingResponse.builder()
                .bookingCode(booking.getBookingCode())
                .bookingStatus("CANCELLED")
                .finalAmount(booking.getFinalAmount())
                .cancellationPenalty(penalty)
                .refundAmount(refund)
                .reason(request.getReason())
                .cancelledAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // UC-052: Check-in Guest
    // =========================================================================
    @Transactional
    @Override
    public BookingDetailResponse checkinGuest(CheckinRequest request) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(request.getBookingCode(), hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("CHECKED-IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.CHECKIN_NOT_ALLOWED);
        }

        // Check-in is only allowed on the scheduled check-in date
        LocalDate today = LocalDate.now();
        if (today.isBefore(booking.getCheckInDate())) {
            throw new AppException(ErrorCode.CHECKIN_DATE_MISMATCH);
        }

        booking.setBookingStatus("CHECKED-IN");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify agency about check-in
        notificationService.sendNotification(
                booking.getUserId(), "BOOKING",
                "Check-in #" + booking.getBookingCode(),
                "Khách đã check-in cho đơn #" + booking.getBookingCode() + ".",
                "BOOKING", String.valueOf(booking.getBookingId()),
                "/agency/booking-list/detail/" + booking.getBookingCode()
        );

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // UC-052: Check-out Guest (from IN_HOUSE to COMPLETED)
    @Transactional
    @Override
    public BookingDetailResponse checkoutGuest(String bookingCode) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(bookingCode, hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if ("COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_COMPLETED);
        }
        if (!"CHECKED_IN".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_CHECKED_IN);
        }

        booking.setBookingStatus("COMPLETED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify agency about checkout
        notificationService.sendNotification(
                booking.getUserId(), "BOOKING",
                "Check-out #" + booking.getBookingCode(),
                "Khách đã check-out cho đơn #" + booking.getBookingCode() + ".",
                "BOOKING", String.valueOf(booking.getBookingId()),
                "/agency/booking-list/detail/" + booking.getBookingCode()
        );

        return bookingMapper.toBookingDetailResponse(booking);
    }

    // =========================================================================
    // UC-053: Report No-show
    // =========================================================================
    @Transactional
    @Override
    public NoShowResponse reportNoShow(NoShowRequest request) {
        Integer hotelId = extractHotelId();

        Booking booking = bookingRepository.findByBookingCodeAndHotelId(request.getBookingCode(), hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!"BOOKED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new AppException(ErrorCode.NOSHOW_NOT_ALLOWED);
        }



        // No-show: only change status, do NOT release inventory and do NOT refund
        booking.setBookingStatus("NO_SHOW");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify agency about no-show
        notificationService.sendNotification(
                booking.getUserId(), "BOOKING",
                "No-show #" + booking.getBookingCode(),
                "Đơn #" + booking.getBookingCode() + " đã được báo cáo không đến (No-show).",
                "BOOKING", String.valueOf(booking.getBookingId()),
                "/agency/booking-list/detail/" + booking.getBookingCode()
        );

        return NoShowResponse.builder()
                .bookingCode(booking.getBookingCode())
                .bookingStatus("NO_SHOW")
                .reason(request.getReason())
                .reportedAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // Inventory Helper: release soldCount for each booking detail's date range
    // =========================================================================
    private void releaseInventory(Booking booking) {
        if (booking.getBookingDetails() == null) return;

        for (BookingDetail detail : booking.getBookingDetails()) {
            Integer roomTypeId = detail.getRoomType() != null
                    ? detail.getRoomType().getRoomTypeId()
                    : null;
            if (roomTypeId == null) continue;

            LocalDate start = detail.getCheckInDate();
            LocalDate end = detail.getCheckOutDate();

            for (LocalDate date = start; date.isBefore(end); date = date.plusDays(1)) {
                roomAllotmentRepository.findByRoomTypeIdAndAllotmentDate(roomTypeId, date)
                        .ifPresent(allotment -> {
                            int newSold = Math.max(0,
                                    (allotment.getSoldCount() != null ? allotment.getSoldCount() : 0)
                                            - detail.getQuantity());
                            allotment.setSoldCount(newSold);
                            roomAllotmentRepository.save(allotment);
                        });
            }
        }
    }

    @Override
    public void recalculateDebts() {

        List<AgencyBooking> allBookings = agencyBookingRepository.findAll();
        LocalDate today = LocalDate.now();

        for (AgencyBooking booking : allBookings) {

            if (Boolean.TRUE.equals(booking.getIsPaid())) {
                continue;
            }

            BigDecimal principal = booking.getPrincipalRemaining() != null
                    ? booking.getPrincipalRemaining()
                    : BigDecimal.ZERO;

            BigDecimal penalty = booking.getPenaltyInterest() != null
                    ? booking.getPenaltyInterest()
                    : BigDecimal.ZERO;

            YearMonth ym = YearMonth.parse(booking.getMonth());
            LocalDate dueDate = ym.plusMonths(1).atDay(2);

            int totalLateDays = 0;
            int totalWorkingDays = 0;
            BigDecimal currentRate = BigDecimal.ZERO;

            if (today.isAfter(dueDate)) {

                LocalDate startDate = dueDate.plusDays(1);

                LocalDate lastCalc = booking.getLastInterestCalculatedDate() != null
                        ? booking.getLastInterestCalculatedDate()
                        : startDate.minusDays(1);

                LocalDate calcFrom = lastCalc.isBefore(startDate)
                        ? startDate
                        : lastCalc.plusDays(1);

                totalLateDays = (int) ChronoUnit.DAYS.between(startDate, today) + 1;

                totalWorkingDays = countWorkingDays(startDate, calcFrom.minusDays(1));

                long daysToCalculate = 0;
                if (!calcFrom.isAfter(today)) {
                    daysToCalculate = ChronoUnit.DAYS.between(calcFrom, today) + 1;
                }

                for (int i = 0; i < daysToCalculate; i++) {

                    LocalDate d = calcFrom.plusDays(i);

                    if (isBusinessDay(d)) {
                        totalWorkingDays++;
                    }

                    BigDecimal rate = (totalWorkingDays <= 15)
                            ? BigDecimal.valueOf(0.0003)
                            : BigDecimal.valueOf(0.0005);

                    BigDecimal dailyInterest = principal
                            .multiply(rate)
                            .setScale(0, RoundingMode.HALF_UP);

                    penalty = penalty.add(dailyInterest);
                }

                currentRate = (totalWorkingDays <= 15)
                        ? BigDecimal.valueOf(0.0003)
                        : BigDecimal.valueOf(0.0005);

                Agency agency = agencyRepository.findById(booking.getAgencyId())
                        .orElseThrow(() -> new RuntimeException("Agency not found"));

                if (totalLateDays > 30) {
                    agency.setStatus("LEGAL");
                } else if (totalWorkingDays > 15) {
                    agency.setStatus("LOCKED");
                } else {
                    agency.setStatus("WARNING");
                }

                agencyRepository.save(agency);

                booking.setLastInterestCalculatedDate(today);

            } else {
                totalLateDays = 0;
                totalWorkingDays = 0;
                currentRate = BigDecimal.ZERO;

                booking.setLastInterestCalculatedDate(null);
            }

            booking.setLateDays(totalLateDays);
            booking.setLateWorkingDays(totalWorkingDays);
            booking.setPenaltyRate(currentRate);
            booking.setPenaltyInterest(penalty);
            booking.setUpdatedAt(LocalDateTime.now());

            agencyBookingRepository.save(booking);
        }

        Set<Long> notifiedAgencies = new HashSet<>();

        for (AgencyBooking ab : allBookings) {

            if (!Boolean.TRUE.equals(ab.getIsPaid())
                    && !notifiedAgencies.contains(ab.getAgencyId())) {

                notifiedAgencies.add(ab.getAgencyId());

                List<Users> agencyUsers =
                        userRepository.findByAgency_AgencyId(ab.getAgencyId());

                for (Users u : agencyUsers) {
                    notificationService.sendNotification(
                            u.getId(),
                            "PAYMENT",
                            "Cập nhật dư nợ",
                            "Dư nợ của đại lý đã được tính lại. Vui lòng kiểm tra.",
                            "AGENCY",
                            String.valueOf(ab.getAgencyId()),
                            "/agency/credit-wallet"
                    );
                }
            }
        }
    }

    private boolean isBusinessDay(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        return dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (isBusinessDay(d)) count++;
        }
        return count;
    }

}
