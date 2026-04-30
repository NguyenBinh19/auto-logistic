//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.promotions.ApplyPromotionRequest;
//import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
//import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
//import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
//import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
//import com.HTPj.htpj.entity.Agency;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.Promotion;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.PromotionMapper;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.PromotionRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.PromotionServiceImpl;
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
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.contains;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.lenient;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.times;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class PromotionServiceImplTest {
//
//    @Mock
//    private PromotionRepository promotionRepository;
//
//    @Mock
//    private PromotionMapper promotionMapper;
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @Mock
//    private UserRepository userRepository;
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
//    @Mock
//    private Jwt jwt;
//
//    @InjectMocks
//    private PromotionServiceImpl promotionService;
//
//    @BeforeEach
//    void setUp() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(jwt);
//    }
//
//    @AfterEach
//    void tearDown() {
//        SecurityContextHolder.clearContext();
//    }
//
//    //create
//    @Test
//    void createPromotion_shouldCreateAndNotifyActiveAgencyUsers_whenAgencyUsageLimitIsPositive() {
//        // GIVEN
//        String userId = "hotel-user-1";
//        Integer hotelId = 101;
//        CreatePromotionRequest request = createRequest("SPRING101", 2);
//        Promotion mappedPromotion = buildValidPromotion("SPRING101");
//        PromotionResponse expectedResponse = PromotionResponse.builder().id(1).code("SPRING101").build();
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder()
//                        .id(userId)
//                        .hotel(Hotel.builder().hotelId(hotelId).build())
//                        .build()
//        ));
//        when(promotionRepository.existsByCode("SPRING101")).thenReturn(false);
//        when(promotionMapper.toEntity(request)).thenReturn(mappedPromotion);
//        when(promotionRepository.save(any(Promotion.class))).thenAnswer(invocation -> {
//            Promotion p = invocation.getArgument(0);
//            p.setId(1);
//            return p;
//        });
//        when(userRepository.findAllActiveAgencyUsers()).thenReturn(List.of(
//                Users.builder().id("agency-user-1").build(),
//                Users.builder().id("agency-user-2").build()
//        ));
//        when(promotionMapper.toPromotionResponse(any(Promotion.class))).thenReturn(expectedResponse);
//
//        // WHEN
//        PromotionResponse actual = promotionService.createPromotion(request);
//
//        // THEN
//        assertEquals(expectedResponse, actual);
//
//        ArgumentCaptor<Promotion> savedPromotionCaptor = ArgumentCaptor.forClass(Promotion.class);
//        verify(promotionRepository).save(savedPromotionCaptor.capture());
//        Promotion savedPromotion = savedPromotionCaptor.getValue();
//        assertEquals(hotelId, savedPromotion.getHotelId());
//        assertEquals(0, savedPromotion.getUsedCount());
//        assertEquals(Boolean.FALSE, savedPromotion.getIsDeleted());
//        assertNotNull(savedPromotion.getCreatedAt());
//
//        ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
//        verify(notificationService, times(2)).sendNotification(
//                userIdCaptor.capture(),
//                eq("PROMOTION"),
//                eq("Khuyến mãi mới"),
//                contains("SPRING101"),
//                eq("PROMOTION"),
//                eq("1"),
//                eq("/agency/search-hotel")
//        );
//        assertEquals(List.of("agency-user-1", "agency-user-2"), userIdCaptor.getAllValues());
//    }
//
//    @Test
//    void createPromotion_shouldThrowUserNotExisted_whenCurrentUserIsMissing() {
//        // GIVEN
//        String userId = "missing-user";
//        CreatePromotionRequest request = createRequest("SPRING102", 2);
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.createPromotion(request));
//
//        // THEN
//        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void createPromotion_shouldThrowHotelNotFound_whenUserHasNoHotel() {
//        // GIVEN
//        String userId = "hotel-user-no-hotel";
//        CreatePromotionRequest request = createRequest("SPRING103", 2);
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(Users.builder().id(userId).hotel(null).build()));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.createPromotion(request));
//
//        // THEN
//        assertEquals(ErrorCode.HOTEL_NOT_FOUND, exception.getErrorCode());
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void createPromotion_shouldThrowPromotionCodeExisted_whenCodeAlreadyExists() {
//        // GIVEN
//        String userId = "hotel-user-2";
//        CreatePromotionRequest request = createRequest("SPRING104", 2);
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder().id(userId).hotel(Hotel.builder().hotelId(202).build()).build()
//        ));
//        when(promotionRepository.existsByCode("SPRING104")).thenReturn(true);
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.createPromotion(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_CODE_EXISTED, exception.getErrorCode());
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void createPromotion_shouldCreateSuccessfully_whenAgencyUsageLimitIsZeroOrNull() {
//        // GIVEN
//        String userId = "hotel-user-1";
//        Integer hotelId = 101;
//        CreatePromotionRequest request = createRequest("PROMO_NO_NOTI", 0);
//        Promotion mappedPromotion = buildValidPromotion("PROMO_NO_NOTI");
//        mappedPromotion.setAgencyUsageLimit(0);
//        PromotionResponse expectedResponse = PromotionResponse.builder().id(2).code("PROMO_NO_NOTI").build();
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder()
//                        .id(userId)
//                        .hotel(Hotel.builder().hotelId(hotelId).build())
//                        .build()
//        ));
//        when(promotionRepository.existsByCode("PROMO_NO_NOTI")).thenReturn(false);
//        when(promotionMapper.toEntity(request)).thenReturn(mappedPromotion);
//        when(promotionRepository.save(any(Promotion.class))).thenReturn(mappedPromotion);
//        when(promotionMapper.toPromotionResponse(any(Promotion.class))).thenReturn(expectedResponse);
//
//        // WHEN
//        PromotionResponse actual = promotionService.createPromotion(request);
//
//        // THEN
//        assertEquals(expectedResponse, actual);
//        verify(promotionRepository).save(any(Promotion.class));
//        verify(userRepository, never()).findAllActiveAgencyUsers();
//        verify(notificationService, never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    //delete
//    @Test
//    void deletePromotion_shouldHardDelete_whenUsedCountIsZero() {
//        // GIVEN
//        Promotion promotion = buildValidPromotion("DEL001");
//        promotion.setId(1);
//        promotion.setUsedCount(0);
//
//        when(promotionRepository.findByIdAndIsDeletedFalse(1)).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        promotionService.deletePromotion(1);
//
//        // THEN
//        verify(promotionRepository).delete(promotion);
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_shouldSoftDelete_whenUsedCountIsGreaterThanZero() {
//        // GIVEN
//        Promotion promotion = buildValidPromotion("DEL002");
//        promotion.setId(2);
//        promotion.setUsedCount(3);
//        promotion.setStatus("ACTIVE");
//        promotion.setIsDeleted(false);
//
//        when(promotionRepository.findByIdAndIsDeletedFalse(2)).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        promotionService.deletePromotion(2);
//
//        // THEN
//        verify(promotionRepository, never()).delete(any(Promotion.class));
//        verify(promotionRepository).save(promotion);
//        assertTrue(promotion.getIsDeleted());
//        assertEquals("INACTIVE", promotion.getStatus());
//    }
//
//    @Test
//    void deletePromotion_shouldThrowPromotionNotFound_whenIdDoesNotExist() {
//        // GIVEN
//        when(promotionRepository.findByIdAndIsDeletedFalse(99)).thenReturn(Optional.empty());
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.deletePromotion(99));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_NOT_FOUND, exception.getErrorCode());
//        verify(promotionRepository, never()).delete(any(Promotion.class));
//    }
//
//    @Test
//    void deletePromotion_shouldHardDelete_whenUsedCountIsNull() {
//        // GIVEN
//        Promotion promotion = buildValidPromotion("DEL003");
//        promotion.setId(3);
//        promotion.setUsedCount(null);
//
//        when(promotionRepository.findByIdAndIsDeletedFalse(3)).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        promotionService.deletePromotion(3);
//
//        // THEN
//        verify(promotionRepository).delete(promotion);
//        verify(promotionRepository, never()).save(any(Promotion.class));
//    }
//
//    //getavai
//    @Test
//    void getAvailablePromotions_shouldReturnOnlyEligiblePublicActivePromotions_afterApplyingAllFilters() {
//        // GIVEN
//        String userId = "agency-user-main";
//        Long agencyId = 300L;
//        ApplyPromotionRequest request = ApplyPromotionRequest.builder()
//                .hotelId(88)
//                .checkin(LocalDate.now().plusDays(2))
//                .checkout(LocalDate.now().plusDays(5))
//                .billAmount(new BigDecimal("300"))
//                .build();
//
//        Promotion eligible = buildValidPromotion("PASS");
//        eligible.setHotelId(88);
//
//        Promotion nonPublic = buildValidPromotion("NOT_PUBLIC");
//        nonPublic.setTypePromotion("PRIVATE");
//
//        Promotion deleted = buildValidPromotion("DELETED");
//        deleted.setIsDeleted(true);
//
//        Promotion inactive = buildValidPromotion("INACTIVE");
//        inactive.setStatus("INACTIVE");
//
//        Promotion usageExceeded = buildValidPromotion("USAGE_EXCEEDED");
//        usageExceeded.setUsedCount(usageExceeded.getMaxUsage());
//
//        Promotion minOrderNotMet = buildValidPromotion("MIN_ORDER");
//        minOrderNotMet.setMinOrderVal(new BigDecimal("999"));
//
//        Promotion applyDateInvalid = buildValidPromotion("APPLY_DATE_INVALID");
//        applyDateInvalid.setApplyStartDate(LocalDate.now().plusDays(1));
//        applyDateInvalid.setApplyEndDate(LocalDate.now().plusDays(10));
//
//        Promotion stayDateInvalid = buildValidPromotion("STAY_DATE_INVALID");
//        stayDateInvalid.setStayStartDate(request.getCheckin().plusDays(1));
//
//        Promotion minStayNotMet = buildValidPromotion("MIN_STAY_NOT_MET");
//        minStayNotMet.setMinStay(5);
//
//        Promotion agencyLimitExceeded = buildValidPromotion("AGENCY_LIMIT");
//        agencyLimitExceeded.setAgencyUsageLimit(1);
//
//        ApplyPromotionResponse expectedResponse = ApplyPromotionResponse.builder().id(1).code("PASS").build();
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder().id(userId).agency(Agency.builder().agencyId(agencyId).build()).build()
//        ));
//        when(promotionRepository.findByHotelIdAndIsDeletedFalse(88)).thenReturn(List.of(
//                eligible,
//                nonPublic,
//                deleted,
//                inactive,
//                usageExceeded,
//                minOrderNotMet,
//                applyDateInvalid,
//                stayDateInvalid,
//                minStayNotMet,
//                agencyLimitExceeded
//        ));
//        when(bookingRepository.countAgencyPromotionUsage(agencyId, "PASS")).thenReturn(0L);
//        when(bookingRepository.countAgencyPromotionUsage(agencyId, "AGENCY_LIMIT")).thenReturn(1L);
//        when(promotionMapper.toApplyPromotionResponse(eligible)).thenReturn(expectedResponse);
//
//        // WHEN
//        List<ApplyPromotionResponse> actual = promotionService.getAvailablePromotions(request);
//
//        // THEN
//        assertEquals(1, actual.size());
//        assertEquals("PASS", actual.get(0).getCode());
//        verify(bookingRepository).countAgencyPromotionUsage(agencyId, "PASS");
//        verify(bookingRepository).countAgencyPromotionUsage(agencyId, "AGENCY_LIMIT");
//        verify(promotionMapper, times(1)).toApplyPromotionResponse(eligible);
//    }
//
//    //check promotion code
//    @Test
//    void checkPromotionCode_shouldReturnApplyPromotionResponse_whenAllConditionsPass() {
//        // GIVEN
//        String userId = "agency-user-check-pass";
//        Long agencyId = 500L;
//        CheckPromotionCodeRequest request = validCheckRequest("CHECKPASS", 10);
//        Promotion promotion = buildValidPromotion("CHECKPASS");
//        promotion.setHotelId(10);
//        ApplyPromotionResponse expected = ApplyPromotionResponse.builder().id(10).code("CHECKPASS").build();
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder().id(userId).agency(Agency.builder().agencyId(agencyId).build()).build()
//        ));
//        when(promotionRepository.findByCodeAndIsDeletedFalse("CHECKPASS")).thenReturn(Optional.of(promotion));
//        when(bookingRepository.countAgencyPromotionUsage(agencyId, "CHECKPASS")).thenReturn(0L);
//        when(promotionMapper.toApplyPromotionResponse(promotion)).thenReturn(expected);
//
//        // WHEN
//        ApplyPromotionResponse actual = promotionService.checkPromotionCode(request);
//
//        // THEN
//        assertEquals(expected, actual);
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionCodeInvalid_whenCodeDoesNotExist() {
//        // GIVEN
//        String userId = "agency-user-invalid-code";
//        CheckPromotionCodeRequest request = validCheckRequest("INVALID_CODE", 10);
//
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder().id(userId).agency(Agency.builder().agencyId(700L).build()).build()
//        ));
//        when(promotionRepository.findByCodeAndIsDeletedFalse("INVALID_CODE")).thenReturn(Optional.empty());
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_CODE_INVALID, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionInactive_whenStatusIsNotActive() {
//        // GIVEN
//        String userId = "agency-user-inactive";
//        CheckPromotionCodeRequest request = validCheckRequest("INACTIVE_CODE", 10);
//        Promotion promotion = buildValidPromotion("INACTIVE_CODE");
//        promotion.setStatus("INACTIVE");
//
//        stubAuthenticatedAgency(userId, 701L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("INACTIVE_CODE")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_INACTIVE, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionUsageExceeded_whenUsedCountReachesMaxUsage() {
//        // GIVEN
//        String userId = "agency-user-usage-exceeded";
//        CheckPromotionCodeRequest request = validCheckRequest("USAGE_MAX", 10);
//        Promotion promotion = buildValidPromotion("USAGE_MAX");
//        promotion.setUsedCount(promotion.getMaxUsage());
//
//        stubAuthenticatedAgency(userId, 702L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("USAGE_MAX")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_USAGE_EXCEEDED, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionNotApplicableHotel_whenHotelDoesNotMatch() {
//        // GIVEN
//        String userId = "agency-user-hotel-mismatch";
//        CheckPromotionCodeRequest request = validCheckRequest("HOTEL_MISMATCH", 99);
//        Promotion promotion = buildValidPromotion("HOTEL_MISMATCH");
//        promotion.setHotelId(10);
//
//        stubAuthenticatedAgency(userId, 703L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("HOTEL_MISMATCH")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_NOT_APPLICABLE_HOTEL, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionMinOrderNotMet_whenBillAmountIsTooLow() {
//        // GIVEN
//        String userId = "agency-user-min-order";
//        CheckPromotionCodeRequest request = validCheckRequest("MIN_ORDER_FAIL", 10);
//        request.setBillAmount(new BigDecimal("50"));
//        Promotion promotion = buildValidPromotion("MIN_ORDER_FAIL");
//        promotion.setMinOrderVal(new BigDecimal("100"));
//
//        stubAuthenticatedAgency(userId, 704L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("MIN_ORDER_FAIL")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionExpired_whenCurrentDateOutOfApplyWindow() {
//        // GIVEN
//        String userId = "agency-user-expired";
//        CheckPromotionCodeRequest request = validCheckRequest("EXPIRED_FAIL", 10);
//        Promotion promotion = buildValidPromotion("EXPIRED_FAIL");
//        promotion.setApplyStartDate(LocalDate.now().plusDays(1));
//        promotion.setApplyEndDate(LocalDate.now().plusDays(5));
//
//        stubAuthenticatedAgency(userId, 705L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("EXPIRED_FAIL")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_EXPIRED, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionStayDateInvalid_whenStayDatesOutOfRange() {
//        // GIVEN
//        String userId = "agency-user-stay-invalid";
//        CheckPromotionCodeRequest request = validCheckRequest("STAY_INVALID_FAIL", 10);
//        Promotion promotion = buildValidPromotion("STAY_INVALID_FAIL");
//        promotion.setStayStartDate(request.getCheckin().plusDays(1));
//
//        stubAuthenticatedAgency(userId, 706L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("STAY_INVALID_FAIL")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_STAY_DATE_INVALID, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionMinStayNotMet_whenNightsAreBelowMinimumStay() {
//        // GIVEN
//        String userId = "agency-user-min-stay";
//        CheckPromotionCodeRequest request = validCheckRequest("MIN_STAY_FAIL", 10);
//        Promotion promotion = buildValidPromotion("MIN_STAY_FAIL");
//        promotion.setMinStay(10);
//
//        stubAuthenticatedAgency(userId, 707L);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("MIN_STAY_FAIL")).thenReturn(Optional.of(promotion));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_MIN_STAY_NOT_MET, exception.getErrorCode());
//    }
//
//    @Test
//    void checkPromotionCode_shouldThrowPromotionAgencyUsageExceeded_whenAgencyLimitReached() {
//        // GIVEN
//        String userId = "agency-user-agency-limit";
//        Long agencyId = 708L;
//        CheckPromotionCodeRequest request = validCheckRequest("AGENCY_LIMIT_FAIL", 10);
//        Promotion promotion = buildValidPromotion("AGENCY_LIMIT_FAIL");
//        promotion.setAgencyUsageLimit(2);
//
//        stubAuthenticatedAgency(userId, agencyId);
//        when(promotionRepository.findByCodeAndIsDeletedFalse("AGENCY_LIMIT_FAIL")).thenReturn(Optional.of(promotion));
//        when(bookingRepository.countAgencyPromotionUsage(agencyId, "AGENCY_LIMIT_FAIL")).thenReturn(2L);
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> promotionService.checkPromotionCode(request));
//
//        // THEN
//        assertEquals(ErrorCode.PROMOTION_AGENCY_USAGE_EXCEEDED, exception.getErrorCode());
//    }
//
//    private void stubAuthenticatedAgency(String userId, Long agencyId) {
//        when(jwt.getClaim("userId")).thenReturn(userId);
//        when(userRepository.findById(userId)).thenReturn(Optional.of(
//                Users.builder().id(userId).agency(Agency.builder().agencyId(agencyId).build()).build()
//        ));
//    }
//
//    private CreatePromotionRequest createRequest(String code, Integer agencyUsageLimit) {
//        LocalDate now = LocalDate.now();
//        return CreatePromotionRequest.builder()
//                .code(code)
//                .name("Promo " + code)
//                .typePromotion("PUBLIC")
//                .typeDiscount("PERCENT")
//                .discountVal(new BigDecimal("10"))
//                .maxDiscount(new BigDecimal("100"))
//                .minOrderVal(new BigDecimal("100"))
//                .applyStartDate(now.minusDays(1))
//                .applyEndDate(now.plusDays(10))
//                .stayStartDate(now.plusDays(1))
//                .stayEndDate(now.plusDays(20))
//                .agencyUsageLimit(agencyUsageLimit)
//                .minStay(1)
//                .maxUsage(100)
//                .status("ACTIVE")
//                .createdBy("tester")
//                .build();
//    }
//
//    private CheckPromotionCodeRequest validCheckRequest(String code, Integer hotelId) {
//        return CheckPromotionCodeRequest.builder()
//                .hotelId(hotelId)
//                .code(code)
//                .checkin(LocalDate.now().plusDays(2))
//                .checkout(LocalDate.now().plusDays(5))
//                .billAmount(new BigDecimal("300"))
//                .build();
//    }
//
//    private Promotion buildValidPromotion(String code) {
//        LocalDate now = LocalDate.now();
//        return Promotion.builder()
//                .id(10)
//                .hotelId(10)
//                .code(code)
//                .name("Promotion " + code)
//                .typePromotion("PUBLIC")
//                .typeDiscount("PERCENT")
//                .discountVal(new BigDecimal("10"))
//                .maxDiscount(new BigDecimal("100"))
//                .minOrderVal(new BigDecimal("100"))
//                .applyStartDate(now.minusDays(1))
//                .applyEndDate(now.plusDays(10))
//                .stayStartDate(now.plusDays(1))
//                .stayEndDate(now.plusDays(20))
//                .minStay(2)
//                .maxUsage(50)
//                .usedCount(1)
//                .agencyUsageLimit(5)
//                .status("ACTIVE")
//                .isDeleted(false)
//                .createdBy("tester")
//                .build();
//    }
//
//}