//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.booking.CancelBookingRequest;
//import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
//import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
//import com.HTPj.htpj.dto.response.booking.BookingDetailResponse;
//import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
//import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
//import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
//import com.HTPj.htpj.entity.*;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.BookingMapper;
//import com.HTPj.htpj.mapper.RoomAvailabilityMapper;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.BookingServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.test.util.ReflectionTestUtils;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.YearMonth;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class BookingServiceImplTest {
//
//    @Mock
//    private RoomTypeRepository roomTypeRepository;
//
//    @Mock
//    private BookingDetailRepository bookingDetailRepository;
//
//    @Mock
//    private RoomAvailabilityMapper roomAvailabilityMapper;
//
//    @Mock
//    private RoomHoldRepository roomHoldRepository;
//
//    @Mock
//    private RoomPricingRuleRepository roomPricingRuleRepository;
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @Mock
//    private BookingMapper bookingMapper;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private BookingAddonServiceRepository bookingAddonServiceRepository;
//
//    @Mock
//    private PromotionService promotionService;
//
//    @Mock
//    private PromotionRepository promotionRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private RoomAllotmentRepository roomAllotmentRepository;
//
//    @Mock
//    private AgencyBookingRevenueRepository agencyBookingRevenueRepository;
//
//    @Mock
//    private AgencyRepository agencyRepository;
//
//    @Mock
//    private AgencyCreditHistoryRepository agencyCreditHistoryRepository;
//
//    @Mock
//    private SystemConfigRepository systemConfigRepository;
//
//    @Mock
//    private AgencyBookingRepository agencyBookingRepository;
//
//    @Mock
//    private TransactionHistoryRepository transactionHistoryRepository;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @Mock
//    private SecurityContext securityContext;
//
//    @Mock
//    private Authentication authentication;
//
//    @InjectMocks
//    private BookingServiceImpl bookingService;
//
//    @BeforeEach
//    void setUp() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//    }
//
//    @AfterEach
//    void tearDown() {
//        SecurityContextHolder.clearContext();
//    }
//
//    //checkAvailability
//    @Test
//    void checkAvailability_shouldReturnInactiveAndSoldOutAndActive_withCorrectQuantities() {
//        // Arrange
//        LocalDate checkIn = LocalDate.of(2026, 4, 20);
//        LocalDate checkOut = LocalDate.of(2026, 4, 22);
//        RoomAvailabilityRequest request = RoomAvailabilityRequest.builder()
//                .hotelId(1)
//                .checkIn(checkIn)
//                .checkOut(checkOut)
//                .build();
//
//        RoomType inactive = roomType(1, "INACTIVE", 10, "100", "Inactive");
//        RoomType soldOut = roomType(2, "ACTIVE", 5, "100", "SoldOut");
//        RoomType active = roomType(3, "ACTIVE", 10, "100", "Active");
//
//        BookingDetail soldOutBooked = BookingDetail.builder().roomType(soldOut).quantity(3).build();
//        BookingDetail activeBooked = BookingDetail.builder().roomType(active).quantity(4).build();
//        RoomHoldDetail soldOutHolding = RoomHoldDetail.builder().roomTypeId(2).quantity(2).build();
//        RoomHoldDetail activeHolding = RoomHoldDetail.builder().roomTypeId(3).quantity(1).build();
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(inactive, soldOut, active));
//        when(bookingDetailRepository.findOverlappingBookings(eq(1), eq(checkIn), eq(checkOut), eq(List.of("BOOKED"))))
//                .thenReturn(List.of(soldOutBooked, activeBooked));
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(1, checkIn, checkOut))
//                .thenReturn(List.of(soldOutHolding, activeHolding));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(anyInt())).thenReturn(List.of());
//
//        when(roomAvailabilityMapper.toInactive(inactive))
//                .thenReturn(RoomAvailabilityResponse.builder().roomTypeId(1).status("inactive").build());
//        when(roomAvailabilityMapper.toActive(eq(active), eq(5), eq(new BigDecimal("200"))))
//                .thenReturn(RoomAvailabilityResponse.builder()
//                        .roomTypeId(3)
//                        .quantityAvaiable(5)
//                        .price(new BigDecimal("200"))
//                        .status("active")
//                        .build());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(request);
//
//        // Assert
//        assertEquals(3, result.size());
//        assertEquals("inactive", result.get(0).getStatus());
//
//        RoomAvailabilityResponse soldOutResp = result.get(1);
//        assertEquals("sold_out", soldOutResp.getStatus());
//        assertEquals(0, soldOutResp.getQuantityAvaiable());
//        assertEquals(0, soldOutResp.getPrice().compareTo(new BigDecimal("200")));
//
//        RoomAvailabilityResponse activeResp = result.get(2);
//        assertEquals("active", activeResp.getStatus());
//        assertEquals(5, activeResp.getQuantityAvaiable());
//        assertEquals(0, activeResp.getPrice().compareTo(new BigDecimal("200")));
//    }
//
//    @Test
//    void checkAvailability_shouldUseBasePriceWhenNoRuleMatched() {
//        // Arrange
//        LocalDate checkIn = LocalDate.of(2026, 4, 20);
//        LocalDate checkOut = LocalDate.of(2026, 4, 22);
//        RoomType room = roomType(10, "ACTIVE", 8, "150", "Deluxe");
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(room));
//        when(bookingDetailRepository.findOverlappingBookings(eq(1), eq(checkIn), eq(checkOut), anyList())).thenReturn(List.of());
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(1, checkIn, checkOut)).thenReturn(List.of());
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(10)).thenReturn(List.of());
//        when(roomAvailabilityMapper.toActive(eq(room), eq(8), eq(new BigDecimal("300"))))
//                .thenReturn(RoomAvailabilityResponse.builder().roomTypeId(10).price(new BigDecimal("300")).status("active").build());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(RoomAvailabilityRequest.builder()
//                .hotelId(1).checkIn(checkIn).checkOut(checkOut).build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("300").compareTo(result.get(0).getPrice()));
//    }
//
//    @Test
//    void checkAvailability_shouldApplyPercentRuleByDayOfWeek() {
//        // Arrange
//        LocalDate checkIn = LocalDate.of(2026, 4, 20); // Monday
//        LocalDate checkOut = LocalDate.of(2026, 4, 21);
//        RoomType room = roomType(11, "ACTIVE", 3, "100", "Percent");
//        RoomPricingRule percentRule = pricingRule(11, null, null, "monday", "percent", "10", 1);
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(room));
//        when(bookingDetailRepository.findOverlappingBookings(eq(1), eq(checkIn), eq(checkOut), anyList())).thenReturn(List.of());
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(1, checkIn, checkOut)).thenReturn(List.of());
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(11)).thenReturn(List.of(percentRule));
//        when(roomAvailabilityMapper.toActive(eq(room), eq(3), eq(new BigDecimal("110"))))
//                .thenReturn(RoomAvailabilityResponse.builder().price(new BigDecimal("110")).status("active").build());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(RoomAvailabilityRequest.builder()
//                .hotelId(1).checkIn(checkIn).checkOut(checkOut).build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("110").compareTo(result.get(0).getPrice()));
//    }
//
//    @Test
//    void checkAvailability_shouldApplyFixedRuleByDateRange() {
//        // Arrange
//        LocalDate checkIn = LocalDate.of(2026, 5, 10);
//        LocalDate checkOut = LocalDate.of(2026, 5, 11);
//        RoomType room = roomType(12, "ACTIVE", 2, "100", "Fixed");
//        RoomPricingRule fixedRule = pricingRule(12, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 31), null, "fixed", "25", 1);
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(room));
//        when(bookingDetailRepository.findOverlappingBookings(eq(1), eq(checkIn), eq(checkOut), anyList())).thenReturn(List.of());
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(1, checkIn, checkOut)).thenReturn(List.of());
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(12)).thenReturn(List.of(fixedRule));
//        when(roomAvailabilityMapper.toActive(eq(room), eq(2), eq(new BigDecimal("125"))))
//                .thenReturn(RoomAvailabilityResponse.builder().price(new BigDecimal("125")).status("active").build());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(RoomAvailabilityRequest.builder()
//                .hotelId(1).checkIn(checkIn).checkOut(checkOut).build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("125").compareTo(result.get(0).getPrice()));
//    }
//
//    @Test
//    void checkAvailability_shouldChooseLowestPriorityForOverlappingRules() {
//        // Arrange
//        LocalDate checkIn = LocalDate.of(2026, 5, 10);
//        LocalDate checkOut = LocalDate.of(2026, 5, 11);
//        RoomType room = roomType(13, "ACTIVE", 2, "100", "Priority");
//        RoomPricingRule highPriorityNumber = pricingRule(13, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 31), null, "fixed", "60", 9);
//        RoomPricingRule lowPriorityNumber = pricingRule(13, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 31), null, "fixed", "20", 1);
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(room));
//        when(bookingDetailRepository.findOverlappingBookings(eq(1), eq(checkIn), eq(checkOut), anyList())).thenReturn(List.of());
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(1, checkIn, checkOut)).thenReturn(List.of());
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(13)).thenReturn(List.of(highPriorityNumber, lowPriorityNumber));
//        when(roomAvailabilityMapper.toActive(eq(room), eq(2), eq(new BigDecimal("120"))))
//                .thenReturn(RoomAvailabilityResponse.builder().price(new BigDecimal("120")).status("active").build());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(RoomAvailabilityRequest.builder()
//                .hotelId(1).checkIn(checkIn).checkOut(checkOut).build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("120").compareTo(result.get(0).getPrice()));
//    }
//
//    @Test
//    void checkAvailability_shouldReturnSoldOut_whenAvailableQuantityIsExactlyZero() {
//        // Arrange
//        LocalDate date = LocalDate.of(2026, 4, 20);
//        RoomAvailabilityRequest request = RoomAvailabilityRequest.builder()
//                .hotelId(1).checkIn(date).checkOut(date.plusDays(1)).build();
//
//        // 10 rooms total, 7 booked, 3 held -> available = 0
//        RoomType room = roomType(20, "ACTIVE", 10, "100", "ZeroRoom");
//        BookingDetail booked = BookingDetail.builder().roomType(room).quantity(7).build();
//        RoomHoldDetail held = RoomHoldDetail.builder().roomTypeId(20).quantity(3).build();
//
//        when(roomTypeRepository.findByHotel_HotelId(1)).thenReturn(List.of(room));
//        when(bookingDetailRepository.findOverlappingBookings(anyInt(), any(), any(), anyList())).thenReturn(List.of(booked));
//        when(roomHoldRepository.findActiveOverlappingHoldDetails(anyInt(), any(), any())).thenReturn(List.of(held));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(20)).thenReturn(List.of());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(request);
//
//        // Assert
//        assertEquals(1, result.size());
//        assertEquals("sold_out", result.get(0).getStatus());
//        assertEquals(0, result.get(0).getQuantityAvaiable());
//    }
//
//    @Test
//    void checkAvailability_shouldReturnEmptyList_whenNoRoomTypesFound() {
//        // Arrange
//        when(roomTypeRepository.findByHotel_HotelId(99)).thenReturn(List.of());
//
//        // Act
//        List<RoomAvailabilityResponse> result = bookingService.checkAvailability(
//                RoomAvailabilityRequest.builder().hotelId(99).build());
//
//        // Assert
//        assertTrue(result.isEmpty());
//    }
//
//    //create booking
//    @Test
//    void createBooking_shouldSucceedWithCredit_andPercentPromotionMaxDiscount() {
//        // Arrange
//        mockJwtForCreateBooking("user-1");
//        Agency agency = Agency.builder().agencyId(10L).currentCredit(new BigDecimal("500")).walletBalance(new BigDecimal("20")).build();
//        Users user = Users.builder().id("user-1").agency(agency).build();
//        RoomHold hold = hold("HOLDING", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 2), 1, 101, 2);
//        RoomType roomType = roomType(101, "ACTIVE", 20, "100", "R1");
//
//        CreateBookingRequest req = CreateBookingRequest.builder()
//                .holdCode("H001")
//                .paymentMethod("CREDIT")
//                .promotionCode("PROMO10")
//                .guestName("A")
//                .guestPhone("1")
//                .guestEmail("a@b.com")
//                .totalGuests(2)
//                .build();
//
//        ApplyPromotionResponse promo = ApplyPromotionResponse.builder()
//                .id(1)
//                .code("PROMO10")
//                .typeDiscount("PERCENT")
//                .discountVal(new BigDecimal("30"))
//                .maxDiscount(new BigDecimal("40"))
//                .build();
//
//        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
//        when(roomHoldRepository.findByHoldCode("H001")).thenReturn(Optional.of(hold));
//        when(roomTypeRepository.findById(101)).thenReturn(Optional.of(roomType));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(101)).thenReturn(List.of());
//        when(promotionService.checkPromotionCode(any())).thenReturn(promo);
//        when(promotionRepository.findById(1)).thenReturn(Optional.of(Promotion.builder().id(1).build()));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
//            Booking b = inv.getArgument(0);
//            if (b.getBookingId() == null) b.setBookingId(1L);
//            if (b.getBookingCode() == null) b.setBookingCode("B001");
//            return b;
//        });
//        when(agencyCreditHistoryRepository.save(any())).thenAnswer(inv -> {
//            AgencyCreditHistory h = inv.getArgument(0);
//            h.setId(999L);
//            return h;
//        });
//        when(transactionHistoryRepository.save(any())).thenAnswer(inv -> {
//            TransactionHistory t = inv.getArgument(0);
//            if (t.getId() == null) t.setId(777L);
//            return t;
//        });
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(agencyBookingRepository.findByAgencyIdAndMonth(eq(10L), anyString())).thenReturn(Optional.empty());
//        when(agencyBookingRepository.save(any(AgencyBooking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(roomHoldRepository.save(any(RoomHold.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByHotel_HotelId(1)).thenReturn(List.of());
//        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(CreateBookingResponse.builder().bookingCode("B001").build());
//
//        // Act
//        CreateBookingResponse response = bookingService.createBooking(req);
//
//        // Assert
//        assertNotNull(response);
//        verify(promotionRepository).increaseUsedCount(1);
//
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        verify(agencyRepository, atLeastOnce()).save(agencyCaptor.capture());
//        Agency savedAgency = agencyCaptor.getValue();
//        assertEquals(0, new BigDecimal("340").compareTo(savedAgency.getCurrentCredit()));
//    }
//
//    @Test
//    void createBooking_shouldSucceedWithWallet_andAmountPromotion() {
//        // Arrange
//        mockJwtForCreateBooking("user-2");
//        Agency agency = Agency.builder().agencyId(11L).currentCredit(new BigDecimal("0")).walletBalance(new BigDecimal("250")).build();
//        Users user = Users.builder().id("user-2").agency(agency).build();
//        RoomHold hold = hold("HOLDING", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 2), 1, 102, 2);
//        RoomType roomType = roomType(102, "ACTIVE", 20, "100", "R2");
//
//        CreateBookingRequest req = CreateBookingRequest.builder()
//                .holdCode("H002")
//                .paymentMethod("WALLET")
//                .promotionCode("AMT")
//                .guestName("B")
//                .guestPhone("1")
//                .guestEmail("b@b.com")
//                .totalGuests(2)
//                .build();
//
//        ApplyPromotionResponse promo = ApplyPromotionResponse.builder()
//                .id(2)
//                .code("AMT")
//                .typeDiscount("AMOUNT")
//                .discountVal(new BigDecimal("30"))
//                .build();
//
//        when(userRepository.findById("user-2")).thenReturn(Optional.of(user));
//        when(roomHoldRepository.findByHoldCode("H002")).thenReturn(Optional.of(hold));
//        when(roomTypeRepository.findById(102)).thenReturn(Optional.of(roomType));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(102)).thenReturn(List.of());
//        when(promotionService.checkPromotionCode(any())).thenReturn(promo);
//        when(promotionRepository.findById(2)).thenReturn(Optional.of(Promotion.builder().id(2).build()));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
//            Booking b = inv.getArgument(0);
//            if (b.getBookingId() == null) b.setBookingId(2L);
//            if (b.getBookingCode() == null) b.setBookingCode("B002");
//            return b;
//        });
//        when(transactionHistoryRepository.save(any())).thenAnswer(inv -> {
//            TransactionHistory t = inv.getArgument(0);
//            if (t.getId() == null) t.setId(888L);
//            return t;
//        });
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(roomHoldRepository.save(any(RoomHold.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByHotel_HotelId(1)).thenReturn(List.of());
//        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(CreateBookingResponse.builder().bookingCode("B002").build());
//
//        // Act
//        CreateBookingResponse response = bookingService.createBooking(req);
//
//        // Assert
//        assertNotNull(response);
//        verify(agencyCreditHistoryRepository, never()).save(any());
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        verify(agencyRepository).save(agencyCaptor.capture());
//        assertEquals(0, new BigDecimal("80").compareTo(agencyCaptor.getValue().getWalletBalance()));
//    }
//
//    @Test
//    void createBooking_shouldThrowUserNotExisted() {
//        // Arrange
//        mockJwtForCreateBooking("missing-user");
//        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("H").paymentMethod("CREDIT").build()));
//
//        // Assert
//        assertEquals(ErrorCode.USER_NOT_EXISTED, ex.getErrorCode());
//    }
//
//    @Test
//    void createBooking_shouldThrowAgencyNotFound() {
//        // Arrange
//        mockJwtForCreateBooking("user-3");
//        when(userRepository.findById("user-3")).thenReturn(Optional.of(Users.builder().id("user-3").agency(null).build()));
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("H").paymentMethod("CREDIT").build()));
//
//        // Assert
//        assertEquals(ErrorCode.AGENCY_NOT_FOUND, ex.getErrorCode());
//    }
//
//    @Test
//    void createBooking_shouldThrowHoldNotFound() {
//        // Arrange
//        mockJwtForCreateBooking("user-4");
//        when(userRepository.findById("user-4")).thenReturn(Optional.of(Users.builder()
//                .id("user-4")
//                .agency(Agency.builder().agencyId(1L).build())
//                .build()));
//        when(roomHoldRepository.findByHoldCode("H404")).thenReturn(Optional.empty());
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("H404").paymentMethod("CREDIT").build()));
//
//        // Assert
//        assertEquals(ErrorCode.HOLD_NOT_FOUND, ex.getErrorCode());
//    }
//
//    @Test
//    void createBooking_shouldThrowHoldExpired() {
//        // Arrange
//        mockJwtForCreateBooking("user-5");
//        when(userRepository.findById("user-5")).thenReturn(Optional.of(Users.builder()
//                .id("user-5")
//                .agency(Agency.builder().agencyId(1L).build())
//                .build()));
//        when(roomHoldRepository.findByHoldCode("HEX")).thenReturn(Optional.of(hold("BOOKED", LocalDate.now().plusDays(1), LocalDate.now().plusDays(2), 1, 100, 1)));
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("HEX").paymentMethod("CREDIT").build()));
//
//        // Assert
//        assertEquals(ErrorCode.HOLD_EXPIRED, ex.getErrorCode());
//    }
//
//    @Test
//    void createBooking_shouldThrowInsufficientBalance_forCredit() {
//        // Arrange
//        mockJwtForCreateBooking("user-6");
//        Agency agency = Agency.builder().agencyId(1L).currentCredit(new BigDecimal("10")).build();
//        when(userRepository.findById("user-6")).thenReturn(Optional.of(Users.builder().id("user-6").agency(agency).build()));
//        RoomHold hold = hold("HOLDING", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 2), 1, 201, 1);
//        when(roomHoldRepository.findByHoldCode("HCREDIT")).thenReturn(Optional.of(hold));
//        when(roomTypeRepository.findById(201)).thenReturn(Optional.of(roomType(201, "ACTIVE", 10, "100", "R")));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(201)).thenReturn(List.of());
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("HCREDIT").paymentMethod("CREDIT").totalGuests(1).build()));
//
//        // Assert
//        assertEquals(ErrorCode.INSUFFICIENT_BALANCE, ex.getErrorCode());
//    }
//
//    @Test
//    void createBooking_shouldThrowInsufficientBalance_forWallet() {
//        // Arrange
//        mockJwtForCreateBooking("user-7");
//        Agency agency = Agency.builder().agencyId(1L).walletBalance(new BigDecimal("10")).build();
//        when(userRepository.findById("user-7")).thenReturn(Optional.of(Users.builder().id("user-7").agency(agency).build()));
//        RoomHold hold = hold("HOLDING", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 2), 1, 202, 1);
//        when(roomHoldRepository.findByHoldCode("HWALLET")).thenReturn(Optional.of(hold));
//        when(roomTypeRepository.findById(202)).thenReturn(Optional.of(roomType(202, "ACTIVE", 10, "100", "R")));
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(202)).thenReturn(List.of());
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.createBooking(CreateBookingRequest.builder().holdCode("HWALLET").paymentMethod("WALLET").totalGuests(1).build()));
//
//        // Assert
//        assertEquals(ErrorCode.INSUFFICIENT_BALANCE, ex.getErrorCode());
//    }
//
//    //cancel
//    @Test
//    void cancelBooking_shouldFullRefundForCredit() {
//        // Arrange
//        Booking booking = bookingForCancel("BOOKED", "CREDIT", LocalDate.now().plusDays(10), new BigDecimal("100"));
//        Agency agency = Agency.builder().agencyId(booking.getAgencyId()).currentCredit(new BigDecimal("50")).build();
//        RoomAllotment allotment = RoomAllotment.builder().roomTypeId(booking.getBookingDetails().get(0).getRoomType().getRoomTypeId()).soldCount(3).build();
//
//        when(bookingRepository.findByBookingCode("B-CANCEL")).thenReturn(Optional.of(booking));
//        when(systemConfigRepository.findByConfigCode(anyString())).thenReturn(Optional.empty());
//        when(roomAllotmentRepository.findByRoomTypeIdAndAllotmentDate(anyInt(), any(LocalDate.class))).thenReturn(Optional.of(allotment));
//        when(agencyRepository.findById(booking.getAgencyId())).thenReturn(Optional.of(agency));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByHotel_HotelId(anyInt())).thenReturn(List.of());
//        when(transactionHistoryRepository.save(any())).thenAnswer(inv -> {
//            TransactionHistory t = inv.getArgument(0);
//            if (t.getId() == null) t.setId(123L);
//            return t;
//        });
//
//        // Act
//        var response = bookingService.cancelBooking(CancelBookingRequest.builder().bookingCode("B-CANCEL").reason("change").build());
//
//        // Assert
//        assertEquals(0, BigDecimal.ZERO.compareTo(response.getCancellationPenalty()));
//        assertEquals(0, new BigDecimal("100").compareTo(response.getRefundAmount()));
//        verify(agencyRepository).save(argThat(a -> new BigDecimal("150").compareTo(a.getCurrentCredit()) == 0));
//    }
//
//    @Test
//    void cancelBooking_shouldApplyFiftyPercentPenaltyForWallet() {
//        // Arrange
//        Booking booking = bookingForCancel("BOOKED", "WALLET", LocalDate.now().plusDays(5), new BigDecimal("100"));
//        Agency agency = Agency.builder().agencyId(booking.getAgencyId()).walletBalance(new BigDecimal("20")).build();
//
//        when(bookingRepository.findByBookingCode("B-CANCEL")).thenReturn(Optional.of(booking));
//        when(systemConfigRepository.findByConfigCode(anyString())).thenReturn(Optional.empty());
//        when(roomAllotmentRepository.findByRoomTypeIdAndAllotmentDate(anyInt(), any(LocalDate.class)))
//                .thenReturn(Optional.of(RoomAllotment.builder().roomTypeId(1).soldCount(2).build()));
//        when(agencyRepository.findById(booking.getAgencyId())).thenReturn(Optional.of(agency));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByHotel_HotelId(anyInt())).thenReturn(List.of());
//        when(transactionHistoryRepository.save(any())).thenAnswer(inv -> {
//            TransactionHistory t = inv.getArgument(0);
//            if (t.getId() == null) t.setId(124L);
//            return t;
//        });
//
//        // Act
//        var response = bookingService.cancelBooking(CancelBookingRequest.builder().bookingCode("B-CANCEL").reason("change").build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("50.00").compareTo(response.getCancellationPenalty()));
//        assertEquals(0, new BigDecimal("50.00").compareTo(response.getRefundAmount()));
//        verify(agencyRepository).save(argThat(a -> new BigDecimal("70.00").compareTo(a.getWalletBalance()) == 0));
//    }
//
//    @Test
//    void cancelBooking_shouldApplyFullPenaltyWhenNearCheckin() {
//        // Arrange
//        Booking booking = bookingForCancel("BOOKED", "CREDIT", LocalDate.now().plusDays(1), new BigDecimal("100"));
//
//        when(bookingRepository.findByBookingCode("B-CANCEL")).thenReturn(Optional.of(booking));
//        when(systemConfigRepository.findByConfigCode(anyString())).thenReturn(Optional.empty());
//        when(roomAllotmentRepository.findByRoomTypeIdAndAllotmentDate(anyInt(), any(LocalDate.class)))
//                .thenReturn(Optional.of(RoomAllotment.builder().roomTypeId(1).soldCount(2).build()));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByHotel_HotelId(anyInt())).thenReturn(List.of());
//
//        // Act
//        var response = bookingService.cancelBooking(CancelBookingRequest.builder().bookingCode("B-CANCEL").reason("late").build());
//
//        // Assert
//        assertEquals(0, new BigDecimal("100.00").compareTo(response.getCancellationPenalty()));
//        assertEquals(0, BigDecimal.ZERO.compareTo(response.getRefundAmount()));
//        verify(agencyRepository, never()).findById(anyLong());
//    }
//
//    @Test
//    void cancelBooking_shouldThrowCancelNotAllowed() {
//        // Arrange
//        Booking booking = bookingForCancel("COMPLETED", "CREDIT", LocalDate.now().plusDays(5), new BigDecimal("100"));
//        when(bookingRepository.findByBookingCode("B-CANCEL")).thenReturn(Optional.of(booking));
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.cancelBooking(CancelBookingRequest.builder().bookingCode("B-CANCEL").build()));
//
//        // Assert
//        assertEquals(ErrorCode.CANCEL_NOT_ALLOWED, ex.getErrorCode());
//    }
//
//    @Test
//    void cancelBooking_shouldThrowCancelPastCheckin() {
//        // Arrange
//        Booking booking = bookingForCancel("BOOKED", "CREDIT", LocalDate.now().minusDays(1), new BigDecimal("100"));
//        when(bookingRepository.findByBookingCode("B-CANCEL")).thenReturn(Optional.of(booking));
//
//        // Act
//        AppException ex = assertThrows(AppException.class,
//                () -> bookingService.cancelBooking(CancelBookingRequest.builder().bookingCode("B-CANCEL").build()));
//
//        // Assert
//        assertEquals(ErrorCode.CANCEL_PAST_CHECKIN, ex.getErrorCode());
//    }
//
//    //perform
//    @Test
//    void performCheckout_shouldSucceedAndCreateRevenue() {
//        // Arrange
//        mockJwtForHotelFlow("hotel-user");
//        Users hotelUser = Users.builder().id("hotel-user").hotel(Hotel.builder().hotelId(9).build()).build();
//        Booking booking = Booking.builder()
//                .bookingId(20L)
//                .bookingCode("BC20")
//                .agencyId(55L)
//                .hotelId(9)
//                .bookingStatus("BOOKED")
//                .finalAmount(new BigDecimal("450"))
//                .checkOutDate(LocalDate.now())
//                .build();
//
//        when(userRepository.findByUsername("hotel-user")).thenReturn(Optional.of(hotelUser));
//        when(bookingRepository.findByBookingCodeAndHotelId("BC20", 9)).thenReturn(Optional.of(booking));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(agencyBookingRevenueRepository.save(any(AgencyBookingRevenue.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(bookingMapper.toBookingDetailResponse(any(Booking.class))).thenReturn(BookingDetailResponse.builder().bookingCode("BC20").build());
//
//        // Act
//        BookingDetailResponse response = bookingService.performCheckout("BC20");
//
//        // Assert
//        assertNotNull(response);
//        verify(agencyBookingRevenueRepository).save(argThat(r ->
//                r.getAgencyId().equals(55L)
//                        && r.getBookingId().equals(20L)
//                        && new BigDecimal("450").compareTo(r.getRevenueAmount()) == 0));
//    }
//
//    @Test
//    void performCheckout_shouldThrowBookingAlreadyCompleted() {
//        // Arrange
//        mockJwtForHotelFlow("hotel-user");
//        when(userRepository.findByUsername("hotel-user"))
//                .thenReturn(Optional.of(Users.builder().id("hotel-user").hotel(Hotel.builder().hotelId(9).build()).build()));
//        when(bookingRepository.findByBookingCodeAndHotelId("BC21", 9))
//                .thenReturn(Optional.of(Booking.builder().bookingCode("BC21").bookingStatus("COMPLETED").hotelId(9).build()));
//
//        // Act
//        AppException ex = assertThrows(AppException.class, () -> bookingService.performCheckout("BC21"));
//
//        // Assert
//        assertEquals(ErrorCode.BOOKING_ALREADY_COMPLETED, ex.getErrorCode());
//    }
//
//    @Test
//    void performCheckout_shouldThrowBookingNotCheckedIn() {
//        //GIVEN
//        mockJwtForHotelFlow("hotel-user");
//        when(userRepository.findByUsername("hotel-user"))
//                .thenReturn(Optional.of(Users.builder().id("hotel-user").hotel(Hotel.builder().hotelId(9).build()).build()));
//        when(bookingRepository.findByBookingCodeAndHotelId("BC22", 9))
//                .thenReturn(Optional.of(Booking.builder().bookingCode("BC22").bookingStatus("PENDING").hotelId(9).build()));
//
//        // Act
//        AppException ex = assertThrows(AppException.class, () -> bookingService.performCheckout("BC22"));
//
//        // Assert
//        assertEquals(ErrorCode.BOOKING_NOT_CHECKED_IN, ex.getErrorCode());
//    }
//
//    @Test
//    void performCheckout_shouldThrowBookingNotFound() {
//        // Arrange
//        mockJwtForHotelFlow("hotel-user");
//        when(userRepository.findByUsername("hotel-user"))
//                .thenReturn(Optional.of(Users.builder().id("hotel-user").hotel(Hotel.builder().hotelId(9).build()).build()));
//        when(bookingRepository.findByBookingCodeAndHotelId("INVALID", 9))
//                .thenReturn(Optional.empty());
//
//        // Act
//        AppException ex = assertThrows(AppException.class, () -> bookingService.performCheckout("INVALID"));
//
//        // Assert
//        assertEquals(ErrorCode.BOOKING_NOT_FOUND, ex.getErrorCode());
//    }
//
//    @Test
//    void performCheckout_shouldSucceedWhenStatusIsCheckedIn() {
//        // Arrange
//        mockJwtForHotelFlow("hotel-user");
//        Users hotelUser = Users.builder().id("hotel-user").hotel(Hotel.builder().hotelId(9).build()).build();
//        Booking booking = Booking.builder()
//                .bookingId(21L)
//                .bookingCode("BC23")
//                .agencyId(55L)
//                .hotelId(9)
//                .bookingStatus("CHECKED-IN")
//                .finalAmount(new BigDecimal("500"))
//                .checkOutDate(LocalDate.now())
//                .build();
//
//        when(userRepository.findByUsername("hotel-user")).thenReturn(Optional.of(hotelUser));
//        when(bookingRepository.findByBookingCodeAndHotelId("BC23", 9)).thenReturn(Optional.of(booking));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(agencyBookingRevenueRepository.save(any(AgencyBookingRevenue.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(bookingMapper.toBookingDetailResponse(any(Booking.class))).thenReturn(BookingDetailResponse.builder().bookingCode("BC23").build());
//
//        // Act
//        BookingDetailResponse response = bookingService.performCheckout("BC23");
//
//        // Assert
//        assertNotNull(response);
//        assertEquals("COMPLETED", booking.getBookingStatus());
//        verify(agencyBookingRevenueRepository).save(any(AgencyBookingRevenue.class));
//    }
//
//    //recalculateDebts
//    @Test
//    void recalculateDebts_shouldSetWarningAndUseRate00003_forLessThan15WorkingDays() {
//        // Arrange
//        AgencyBooking debt = AgencyBooking.builder()
//                .agencyId(100L)
//                .month(YearMonth.now().minusMonths(1).toString())
//                .isPaid(false)
//                .principalRemaining(new BigDecimal("1000"))
//                .penaltyInterest(BigDecimal.ZERO)
//                .updatedAt(LocalDateTime.now().minusDays(1))
//                .build();
//        Agency agency = Agency.builder().agencyId(100L).status("ACTIVE").build();
//        when(agencyBookingRepository.findAll()).thenReturn(List.of(debt));
//        when(agencyRepository.findById(100L)).thenReturn(Optional.of(agency));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(agencyBookingRepository.save(any(AgencyBooking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByAgency_AgencyId(100L)).thenReturn(List.of(Users.builder().id("u-1").build()));
//
//        // Act
//        bookingService.recalculateDebts();
//
//        // Assert
//        verify(agencyRepository).save(argThat(a -> "WARNING".equals(a.getStatus())));
//        verify(agencyBookingRepository).save(argThat(b ->
//                new BigDecimal("0.3000").compareTo(b.getPenaltyInterest()) == 0
//                        || new BigDecimal("0.3").compareTo(b.getPenaltyInterest()) == 0));
//    }
//
//    @Test
//    void recalculateDebts_shouldSetLockedAndUseRate00005_forMoreThan15WorkingDays() {
//        // Arrange
//        AgencyBooking debt = AgencyBooking.builder()
//                .agencyId(101L)
//                .month(YearMonth.now().minusMonths(2).toString())
//                .isPaid(false)
//                .principalRemaining(new BigDecimal("1000"))
//                .penaltyInterest(BigDecimal.ZERO)
//                .updatedAt(LocalDateTime.now().minusDays(1))
//                .build();
//        Agency agency = Agency.builder().agencyId(101L).status("ACTIVE").build();
//        when(agencyBookingRepository.findAll()).thenReturn(List.of(debt));
//        when(agencyRepository.findById(101L)).thenReturn(Optional.of(agency));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(agencyBookingRepository.save(any(AgencyBooking.class))).thenAnswer(inv -> inv.getArgument(0));
//        when(userRepository.findByAgency_AgencyId(101L)).thenReturn(List.of(Users.builder().id("u-2").build()));
//
//        // Act
//        bookingService.recalculateDebts();
//
//        // Assert
//        verify(agencyRepository).save(argThat(a -> "LOCKED".equals(a.getStatus())));
//        verify(agencyBookingRepository).save(argThat(b ->
//                new BigDecimal("0.5000").compareTo(b.getPenaltyInterest()) == 0
//                        || new BigDecimal("0.5").compareTo(b.getPenaltyInterest()) == 0));
//    }
//
//    @Test
//    void recalculateDebts_shouldSkipPaidBookings() {
//        // Arrange
//        AgencyBooking paid = AgencyBooking.builder()
//                .agencyId(200L)
//                .month(YearMonth.now().minusMonths(2).toString())
//                .isPaid(true)
//                .principalRemaining(new BigDecimal("1000"))
//                .penaltyInterest(BigDecimal.ZERO)
//                .build();
//        when(agencyBookingRepository.findAll()).thenReturn(List.of(paid));
//
//        // Act
//        bookingService.recalculateDebts();
//
//        // Assert
//        verify(agencyRepository, never()).findById(anyLong());
//        verify(agencyBookingRepository, never()).save(any(AgencyBooking.class));
//        verify(notificationService, never()).sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void recalculateDebts_shouldThrowException_whenAgencyNotFound() {
//        // Arrange
//        AgencyBooking debt = AgencyBooking.builder()
//                .agencyId(999L)
//                .month(YearMonth.now().minusMonths(1).toString())
//                .isPaid(false)
//                .principalRemaining(new BigDecimal("1000"))
//                .penaltyInterest(BigDecimal.ZERO)
//                .build();
//        when(agencyBookingRepository.findAll()).thenReturn(List.of(debt));
//        when(agencyRepository.findById(999L)).thenReturn(Optional.empty());
//
//        // Act & Assert
//        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.recalculateDebts());
//        assertEquals("Agency not found", ex.getMessage());
//    }
//
//    @Test
//    void recalculateDebts_shouldNotUpdatePenalty_whenTodayIsBeforeDueDate() {
//        // Arrange
//        AgencyBooking debt = AgencyBooking.builder()
//                .agencyId(102L)
//                .month(YearMonth.now().toString())
//                .isPaid(false)
//                .principalRemaining(new BigDecimal("1000"))
//                .penaltyInterest(BigDecimal.ZERO)
//                .build();
//        when(agencyBookingRepository.findAll()).thenReturn(List.of(debt));
//
//        // Act
//        bookingService.recalculateDebts();
//
//        // Assert
//        verify(agencyRepository, never()).save(any(Agency.class));
//        verify(agencyBookingRepository).save(argThat(b -> b.getPenaltyInterest().compareTo(BigDecimal.ZERO) == 0));
//    }
//
//    //calculateTotalPrice
//    @Test
//    void calculateTotalPrice_shouldUseBasePrice_whenNoRulesActive() {
//        // GIVEN
//        RoomType roomType = RoomType.builder().roomTypeId(1).basePrice(new BigDecimal("100")).build();
//        LocalDate checkIn = LocalDate.of(2026, 5, 1);
//        LocalDate checkOut = LocalDate.of(2026, 5, 2);
//
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(1)).thenReturn(List.of());
//
//        // WHEN
//        BigDecimal result = ReflectionTestUtils.invokeMethod(bookingService, "calculateTotalPrice", roomType, checkIn, checkOut);
//
//        // THEN
//        assertNotNull(result);
//        assertEquals(0, new BigDecimal("100").compareTo(result));
//    }
//
//    @Test
//    void calculateTotalPrice_shouldApplyPercentAdjustment_andPriority() {
//        // GIVEN
//        RoomType roomType = RoomType.builder().roomTypeId(1).basePrice(new BigDecimal("100")).build();
//        LocalDate checkIn = LocalDate.of(2026, 5, 1);
//        LocalDate checkOut = LocalDate.of(2026, 5, 2);
//
//        RoomPricingRule rule1 = RoomPricingRule.builder()
//                .startDate(LocalDate.of(2026, 1, 1)).endDate(LocalDate.of(2026, 12, 31))
//                .adjustmentType("percent").adjustmentValue(new BigDecimal("10"))
//                .priority(2).build();
//
//        RoomPricingRule rule2 = RoomPricingRule.builder()
//                .dayOfWeek("friday")
//                .adjustmentType("fixed").adjustmentValue(new BigDecimal("50"))
//                .priority(1).build();
//
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(1)).thenReturn(List.of(rule1, rule2));
//
//        // WHEN
//        BigDecimal result = ReflectionTestUtils.invokeMethod(bookingService, "calculateTotalPrice", roomType, checkIn, checkOut);
//
//        // THEN
//        assertEquals(0, new BigDecimal("150").compareTo(result));
//    }
//
//    @Test
//    void calculateTotalPrice_shouldApplyMultipleDaysWithDifferentRules() {
//        // GIVEN
//        RoomType roomType = RoomType.builder().roomTypeId(1).basePrice(new BigDecimal("100")).build();
//        LocalDate checkIn = LocalDate.of(2026, 5, 1);
//        LocalDate checkOut = LocalDate.of(2026, 5, 3);
//
//        RoomPricingRule satRule = RoomPricingRule.builder()
//                .dayOfWeek("saturday")
//                .adjustmentType("percent").adjustmentValue(new BigDecimal("20"))
//                .priority(1).build();
//
//        when(roomPricingRuleRepository.findByRoomTypeIdAndIsActiveTrue(1)).thenReturn(List.of(satRule));
//
//        // WHEN
//        BigDecimal result = ReflectionTestUtils.invokeMethod(bookingService, "calculateTotalPrice", roomType, checkIn, checkOut);
//
//        // THEN: Day 1 (100) + Day 2 (120) = 220
//        assertEquals(0, new BigDecimal("220").compareTo(result));
//    }
//
//    private void mockJwtForCreateBooking(String userIdClaim) {
//        Jwt jwt = mock(Jwt.class);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//        lenient().when(jwt.getClaim("userId")).thenReturn(userIdClaim);
//        lenient().when(jwt.getSubject()).thenReturn(userIdClaim);
//    }
//
//    private void mockJwtForHotelFlow(String subject) {
//        Jwt jwt = mock(Jwt.class);
//        when(authentication.getPrincipal()).thenReturn(jwt);
//        when(jwt.getSubject()).thenReturn(subject);
//    }
//
//    private RoomType roomType(Integer id, String status, int total, String basePrice, String title) {
//        return RoomType.builder()
//                .roomTypeId(id)
//                .roomStatus(status)
//                .totalRooms(total)
//                .roomTitle(title)
//                .roomCode("RC" + id)
//                .basePrice(new BigDecimal(basePrice))
//                .maxAdults(2)
//                .maxChildren(1)
//                .build();
//    }
//
//    private RoomPricingRule pricingRule(Integer roomTypeId,
//                                        LocalDate start,
//                                        LocalDate end,
//                                        String dayOfWeek,
//                                        String adjustmentType,
//                                        String adjustmentValue,
//                                        int priority) {
//        return RoomPricingRule.builder()
//                .roomTypeId(roomTypeId)
//                .startDate(start)
//                .endDate(end)
//                .dayOfWeek(dayOfWeek)
//                .adjustmentType(adjustmentType)
//                .adjustmentValue(new BigDecimal(adjustmentValue))
//                .priority(priority)
//                .ruleType("EVENT")
//                .action("INCREASE")
//                .isActive(true)
//                .build();
//    }
//
//    private RoomHold hold(String status,
//                          LocalDate checkIn,
//                          LocalDate checkOut,
//                          Integer hotelId,
//                          Integer roomTypeId,
//                          int qty) {
//        RoomHold hold = RoomHold.builder()
//                .holdCode("H-" + roomTypeId)
//                .status(status)
//                .hotelId(hotelId)
//                .checkInDate(checkIn)
//                .checkOutDate(checkOut)
//                .expiredAt(LocalDateTime.now().plusMinutes(10))
//                .createdAt(LocalDateTime.now())
//                .build();
//        RoomHoldDetail detail = RoomHoldDetail.builder().roomTypeId(roomTypeId).quantity(qty).roomHold(hold).build();
//        hold.setDetails(List.of(detail));
//        return hold;
//    }
//
//    private Booking bookingForCancel(String status, String paymentMethod, LocalDate checkInDate, BigDecimal finalAmount) {
//        RoomType roomType = RoomType.builder().roomTypeId(1).build();
//        BookingDetail detail = BookingDetail.builder()
//                .roomType(roomType)
//                .quantity(1)
//                .checkInDate(checkInDate)
//                .checkOutDate(checkInDate.plusDays(2))
//                .build();
//
//        Booking booking = Booking.builder()
//                .bookingId(99L)
//                .bookingCode("B-CANCEL")
//                .hotelId(1)
//                .agencyId(5L)
//                .userId("agency-user")
//                .bookingStatus(status)
//                .paymentMethod(paymentMethod)
//                .checkInDate(checkInDate)
//                .checkOutDate(checkInDate.plusDays(2))
//                .finalAmount(finalAmount)
//                .bookingDetails(List.of(detail))
//                .build();
//        detail.setBooking(booking);
//        return booking;
//    }
//
//}