//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
//import com.HTPj.htpj.dto.request.commission.UpdateCommissionRequest;
//import com.HTPj.htpj.entity.Commission;
//import com.HTPj.htpj.entity.CommissionHotel;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.CommissionServiceImpl;
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
//import java.time.LocalDateTime;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.ArgumentMatchers.anyLong;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.BDDMockito.then;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class CommissionServiceImplTest {
//
//    @Mock
//    private CommissionRepository commissionRepository;
//
//    @Mock
//    private CommissionHotelRepository commissionHotelRepository;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @Mock
//    private SystemLogRepository systemLogRepository;
//
//    @Mock
//    private SecurityContext securityContext;
//
//    @Mock
//    private Authentication authentication;
//
//    @InjectMocks
//    private CommissionServiceImpl commissionService;
//
//    @BeforeEach
//    void setUpSecurityContext() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//        lenient().when(authentication.getPrincipal()).thenReturn(buildJwt("test-user-id"));
//    }
//
//    @AfterEach
//    void clearSecurityContext() {
//        SecurityContextHolder.clearContext();
//    }
//
//    //create
//    @Test
//    void create_default_success() {
//        // GIVEN
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("DEFAULT")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("10"))
//                .note("default")
//                .build();
//
//        given(commissionRepository.findDefault()).willReturn(Optional.empty());
//        given(commissionRepository.save(any(Commission.class))).willAnswer(invocation -> {
//            Commission commission = invocation.getArgument(0);
//            commission.setCommissionId(1L);
//            return commission;
//        });
//
//        // WHEN
//        String result = commissionService.create(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Create successfully");
//
//        ArgumentCaptor<Commission> commissionCaptor = ArgumentCaptor.forClass(Commission.class);
//        then(commissionRepository).should().save(commissionCaptor.capture());
//        Commission saved = commissionCaptor.getValue();
//
//        assertThat(saved.getCommissionType()).isEqualTo("DEFAULT");
//        assertThat(saved.getRateType()).isEqualTo("PERCENT");
//        assertThat(saved.getCommissionValue()).isEqualByComparingTo("10");
//        assertThat(saved.getIsActive()).isTrue();
//        assertThat(saved.getStartDate()).isNull();
//        assertThat(saved.getEndDate()).isNull();
//        assertThat(saved.getCreatedBy()).isEqualTo("test-user-id");
//        assertThat(saved.getUpdatedBy()).isEqualTo("test-user-id");
//
//        then(systemLogRepository).should().save(any());
//        then(notificationService).should(never())
//                .sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void create_default_failure_whenDefaultAlreadyExists() {
//        // GIVEN
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("DEFAULT")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("10"))
//                .build();
//
//        given(commissionRepository.findDefault())
//                .willReturn(Optional.of(Commission.builder().commissionId(99L).commissionType("DEFAULT").build()));
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.create(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.DEFAULT_ALREADY_EXIST));
//
//        then(commissionRepository).should(never()).save(any(Commission.class));
//        then(systemLogRepository).should(never()).save(any());
//    }
//
//    @Test
//    void create_deal_success_withValidDates() {
//        // GIVEN
//        LocalDateTime start = LocalDateTime.now().plusDays(1);
//        LocalDateTime end = LocalDateTime.now().plusDays(7);
//
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("DEAL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("12.5"))
//                .startDate(start)
//                .endDate(end)
//                .isActive(true)
//                .note("deal")
//                .build();
//
//        given(commissionRepository.save(any(Commission.class))).willAnswer(invocation -> {
//            Commission commission = invocation.getArgument(0);
//            commission.setCommissionId(2L);
//            return commission;
//        });
//
//        // WHEN
//        String result = commissionService.create(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Create successfully");
//
//        ArgumentCaptor<Commission> commissionCaptor = ArgumentCaptor.forClass(Commission.class);
//        then(commissionRepository).should().save(commissionCaptor.capture());
//        Commission saved = commissionCaptor.getValue();
//
//        assertThat(saved.getCommissionType()).isEqualTo("DEAL");
//        assertThat(saved.getStartDate()).isEqualTo(start);
//        assertThat(saved.getEndDate()).isEqualTo(end);
//        assertThat(saved.getIsActive()).isTrue();
//        assertThat(saved.getCommissionValue()).isEqualByComparingTo("12.5");
//
//        then(systemLogRepository).should().save(any());
//    }
//
//    @Test
//    void create_hotel_success_shouldCreateMappingsUpdateHotelsAndNotifyUsers() {
//        // GIVEN
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("HOTEL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("15"))
//                .note("hotel commission")
//                .hotelIds(List.of(101, 102))
//                .build();
//
//        Hotel h1 = Hotel.builder().hotelId(101).hotelName("H1").build();
//        Hotel h2 = Hotel.builder().hotelId(102).hotelName("H2").build();
//
//        Users u1 = Users.builder().id("u-101").build();
//        Users u2 = Users.builder().id("u-102").build();
//
//        given(commissionRepository.save(any(Commission.class))).willAnswer(invocation -> {
//            Commission commission = invocation.getArgument(0);
//            commission.setCommissionId(3L);
//            return commission;
//        });
//        given(hotelRepository.findById(101)).willReturn(Optional.of(h1));
//        given(hotelRepository.findById(102)).willReturn(Optional.of(h2));
//        given(userRepository.findByHotel_HotelId(101)).willReturn(List.of(u1));
//        given(userRepository.findByHotel_HotelId(102)).willReturn(List.of(u2));
//
//        // WHEN
//        String result = commissionService.create(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Create successfully");
//
//        ArgumentCaptor<CommissionHotel> mappingCaptor = ArgumentCaptor.forClass(CommissionHotel.class);
//        then(commissionHotelRepository).should(times(2)).save(mappingCaptor.capture());
//        assertThat(mappingCaptor.getAllValues()).extracting(CommissionHotel::getHotelId)
//                .containsExactlyInAnyOrder(101, 102);
//        assertThat(mappingCaptor.getAllValues()).extracting(CommissionHotel::getCommissionId)
//                .containsOnly(3L);
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should(times(2)).save(hotelCaptor.capture());
//        assertThat(hotelCaptor.getAllValues()).allSatisfy(hotel -> {
//            assertThat(hotel.getCommissionType()).isEqualTo("HOTEL");
//            assertThat(hotel.getCommissionId()).isEqualTo(3L);
//            assertThat(hotel.getRateType()).isEqualTo("PERCENT");
//            assertThat(hotel.getCommissionValue()).isEqualByComparingTo("15");
//            assertThat(hotel.getCommissionUpdatedBy()).isEqualTo("test-user-id");
//        });
//
//        then(notificationService).should().sendNotification(
//                eq("u-101"), eq("COMMISSION"), eq("Cập nhật hoa hồng"),
//                eq("Hoa hồng cho khách sạn của bạn đã được thiết lập."),
//                eq("COMMISSION"), eq("3"), eq("/hotel/profile")
//        );
//        then(notificationService).should().sendNotification(
//                eq("u-102"), eq("COMMISSION"), eq("Cập nhật hoa hồng"),
//                eq("Hoa hồng cho khách sạn của bạn đã được thiết lập."),
//                eq("COMMISSION"), eq("3"), eq("/hotel/profile")
//        );
//    }
//
//    @Test
//    void create_hotel_failure_whenHotelNotFound() {
//        // GIVEN
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("HOTEL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("8"))
//                .hotelIds(List.of(999))
//                .build();
//
//        given(commissionRepository.save(any(Commission.class))).willAnswer(invocation -> {
//            Commission commission = invocation.getArgument(0);
//            commission.setCommissionId(4L);
//            return commission;
//        });
//        given(hotelRepository.findById(999)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.create(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        then(commissionHotelRepository).should().save(any(CommissionHotel.class));
//        then(notificationService).should(never())
//                .sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void create_hotel_withEmptyHotelIds_shouldStillSaveCommission() {
//        // GIVEN
//        CreateCommissionRequest request = CreateCommissionRequest.builder()
//                .commissionType("HOTEL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("10"))
//                .hotelIds(Collections.emptyList())
//                .build();
//
//        given(commissionRepository.save(any(Commission.class))).willAnswer(invocation -> {
//            Commission commission = invocation.getArgument(0);
//            commission.setCommissionId(5L);
//            return commission;
//        });
//
//        // WHEN
//        String result = commissionService.create(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Create successfully");
//        then(commissionHotelRepository).should(never()).save(any());
//        then(notificationService).should(never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    //update
//    @Test
//    void update_failure_whenCommissionNotFound() {
//        // GIVEN
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder().commissionId(999L).build();
//        given(commissionRepository.findById(999L)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.update(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.COMMISSION_NOT_FOUND));
//
//        then(commissionRepository).should(never()).save(any(Commission.class));
//    }
//
//    @Test
//    void update_default_success_shouldUpdateDefaultFields() {
//        // GIVEN
//        Commission commission = Commission.builder()
//                .commissionId(10L)
//                .commissionType("DEFAULT")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("10"))
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(10L)
//                .rateType("FIXED")
//                .commissionValue(new BigDecimal("200"))
//                .note("new default")
//                .reason("policy update")
//                .build();
//
//        given(commissionRepository.findById(10L)).willReturn(Optional.of(commission));
//
//        // WHEN
//        String result = commissionService.update(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Update successfully");
//
//        ArgumentCaptor<Commission> commissionCaptor = ArgumentCaptor.forClass(Commission.class);
//        then(commissionRepository).should().save(commissionCaptor.capture());
//        Commission saved = commissionCaptor.getValue();
//
//        assertThat(saved.getRateType()).isEqualTo("FIXED");
//        assertThat(saved.getCommissionValue()).isEqualByComparingTo("200");
//        assertThat(saved.getNote()).isEqualTo("new default");
//        assertThat(saved.getReason()).isEqualTo("policy update");
//        assertThat(saved.getUpdatedBy()).isEqualTo("test-user-id");
//    }
//
//    @Test
//    void update_deal_success_whenIsUsed_shouldOnlyUpdateDatesAndNotes() {
//        // GIVEN
//        LocalDateTime start = LocalDateTime.now().plusDays(2);
//        LocalDateTime end = LocalDateTime.now().plusDays(10);
//
//        Commission commission = Commission.builder()
//                .commissionId(20L)
//                .commissionType("DEAL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("11"))
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(20L)
//                .rateType("FIXED")
//                .commissionValue(new BigDecimal("999"))
//                .startDate(start)
//                .endDate(end)
//                .note("used deal")
//                .reason("extend")
//                .build();
//
//        given(commissionRepository.findById(20L)).willReturn(Optional.of(commission));
//        given(hotelRepository.findByCommissionId(20L)).willReturn(List.of(Hotel.builder().hotelId(1).build()));
//
//        // WHEN
//        String result = commissionService.update(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Update successfully");
//
//        ArgumentCaptor<Commission> commissionCaptor = ArgumentCaptor.forClass(Commission.class);
//        then(commissionRepository).should().save(commissionCaptor.capture());
//        Commission saved = commissionCaptor.getValue();
//
//        assertThat(saved.getRateType()).isEqualTo("PERCENT");
//        assertThat(saved.getCommissionValue()).isEqualByComparingTo("11");
//        assertThat(saved.getStartDate()).isEqualTo(start);
//        assertThat(saved.getEndDate()).isEqualTo(end);
//        assertThat(saved.getNote()).isEqualTo("used deal");
//        assertThat(saved.getReason()).isEqualTo("extend");
//    }
//
//    @Test
//    void update_deal_success_whenNotUsed_shouldUpdateAllFields() {
//        // GIVEN
//        LocalDateTime start = LocalDateTime.now().plusDays(1);
//        LocalDateTime end = LocalDateTime.now().plusDays(5);
//
//        Commission commission = Commission.builder()
//                .commissionId(21L)
//                .commissionType("DEAL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("7"))
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(21L)
//                .rateType("FIXED")
//                .commissionValue(new BigDecimal("300"))
//                .startDate(start)
//                .endDate(end)
//                .note("not used deal")
//                .reason("replace")
//                .build();
//
//        given(commissionRepository.findById(21L)).willReturn(Optional.of(commission));
//        given(hotelRepository.findByCommissionId(21L)).willReturn(List.of());
//
//        // WHEN
//        String result = commissionService.update(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Update successfully");
//
//        ArgumentCaptor<Commission> commissionCaptor = ArgumentCaptor.forClass(Commission.class);
//        then(commissionRepository).should().save(commissionCaptor.capture());
//        Commission saved = commissionCaptor.getValue();
//
//        assertThat(saved.getRateType()).isEqualTo("FIXED");
//        assertThat(saved.getCommissionValue()).isEqualByComparingTo("300");
//        assertThat(saved.getStartDate()).isEqualTo(start);
//        assertThat(saved.getEndDate()).isEqualTo(end);
//        assertThat(saved.getNote()).isEqualTo("not used deal");
//        assertThat(saved.getReason()).isEqualTo("replace");
//    }
//
//    @Test
//    void update_hotel_success_forExistingLinkedHotels() {
//        // GIVEN
//        Commission commission = Commission.builder()
//                .commissionId(30L)
//                .commissionType("HOTEL")
//                .commissionValue(new BigDecimal("5"))
//                .rateType("PERCENT")
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(30L)
//                .rateType("FIXED")
//                .commissionValue(new BigDecimal("500"))
//                .note("existing links")
//                .reason("annual update")
//                .build();
//
//        CommissionHotel link = CommissionHotel.builder().commissionId(30L).hotelId(201).build();
//        Hotel hotel = Hotel.builder().hotelId(201).hotelName("Hotel 201").build();
//
//        Users hotelUser = Users.builder().id("hotel-user-201").build();
//
//        given(commissionRepository.findById(30L)).willReturn(Optional.of(commission));
//        given(commissionHotelRepository.findByCommissionId(30L)).willReturn(List.of(link));
//        given(hotelRepository.findById(201)).willReturn(Optional.of(hotel));
//        given(userRepository.findByHotel_HotelId(201)).willReturn(List.of(hotelUser));
//
//        // WHEN
//        String result = commissionService.update(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Update successfully");
//
//        then(commissionHotelRepository).should(never()).save(any(CommissionHotel.class));
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should().save(hotelCaptor.capture());
//        Hotel updated = hotelCaptor.getValue();
//        assertThat(updated.getRateType()).isEqualTo("FIXED");
//        assertThat(updated.getCommissionValue()).isEqualByComparingTo("500");
//        assertThat(updated.getCommissionUpdatedBy()).isEqualTo("test-user-id");
//
//        then(notificationService).should().sendNotification(
//                eq("hotel-user-201"), eq("COMMISSION"), eq("Cập nhật hoa hồng"),
//                eq("Hoa hồng của khách sạn bạn đã được cập nhật."),
//                eq("COMMISSION"), eq("30"), eq("/hotel/profile")
//        );
//    }
//
//    @Test
//    void update_hotel_success_shouldAddNewLinksWhenNoExistingLinks() {
//        // GIVEN
//        Commission commission = Commission.builder()
//                .commissionId(31L)
//                .commissionType("HOTEL")
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(31L)
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("9"))
//                .note("new links")
//                .hotelIds(List.of(301, 302))
//                .reason("new hotels")
//                .build();
//
//        Hotel hotel301 = Hotel.builder().hotelId(301).build();
//        Hotel hotel302 = Hotel.builder().hotelId(302).build();
//
//        CommissionHotel link301 = CommissionHotel.builder().commissionId(31L).hotelId(301).build();
//        CommissionHotel link302 = CommissionHotel.builder().commissionId(31L).hotelId(302).build();
//
//        Users u301 = Users.builder().id("u-301").build();
//        Users u302 = Users.builder().id("u-302").build();
//
//        given(commissionRepository.findById(31L)).willReturn(Optional.of(commission));
//        given(commissionHotelRepository.findByCommissionId(31L)).willReturn(List.of(), List.of(link301, link302));
//        given(hotelRepository.findById(301)).willReturn(Optional.of(hotel301));
//        given(hotelRepository.findById(302)).willReturn(Optional.of(hotel302));
//        given(userRepository.findByHotel_HotelId(301)).willReturn(List.of(u301));
//        given(userRepository.findByHotel_HotelId(302)).willReturn(List.of(u302));
//
//        // WHEN
//        String result = commissionService.update(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Update successfully");
//
//        then(commissionHotelRepository).should(times(2)).save(any(CommissionHotel.class));
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should(times(2)).save(hotelCaptor.capture());
//        assertThat(hotelCaptor.getAllValues()).allSatisfy(hotel -> {
//            assertThat(hotel.getCommissionId()).isEqualTo(31L);
//            assertThat(hotel.getCommissionType()).isEqualTo("HOTEL");
//            assertThat(hotel.getRateType()).isEqualTo("PERCENT");
//            assertThat(hotel.getCommissionValue()).isEqualByComparingTo("9");
//        });
//
//        then(notificationService).should(times(2)).sendNotification(
//                anyString(), eq("COMMISSION"), eq("Cập nhật hoa hồng"),
//                eq("Hoa hồng của khách sạn bạn đã được cập nhật."),
//                eq("COMMISSION"), eq("31"), eq("/hotel/profile")
//        );
//    }
//
//    @Test
//    void update_hotel_failure_whenHotelIdNotFound() {
//        // GIVEN
//        Commission commission = Commission.builder()
//                .commissionId(40L)
//                .commissionType("HOTEL")
//                .build();
//
//        UpdateCommissionRequest request = UpdateCommissionRequest.builder()
//                .commissionId(40L)
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("10"))
//                .hotelIds(List.of(404))
//                .build();
//
//        given(commissionRepository.findById(40L)).willReturn(Optional.of(commission));
//        given(commissionHotelRepository.findByCommissionId(40L)).willReturn(List.of()); // Not existed path
//        given(hotelRepository.findById(404)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.update(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        then(notificationService).should(never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    //setDefaultCommission
//    @Test
//    void setDefaultCommission_failure_whenHotelNotFoundOrInactive() {
//        // GIVEN
//        given(hotelRepository.findByHotelIdAndStatus(1001, "ACTIVE")).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.setDefaultCommission(1001))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        then(commissionRepository).should(never()).findDefault();
//    }
//
//    @Test
//    void setDefaultCommission_failure_whenGlobalDefaultNotConfigured() {
//        // GIVEN
//        Hotel hotel = Hotel.builder().hotelId(401).status("ACTIVE").commissionType("HOTEL").build();
//        given(hotelRepository.findByHotelIdAndStatus(401, "ACTIVE")).willReturn(Optional.of(hotel));
//        given(commissionRepository.findDefault()).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> commissionService.setDefaultCommission(401))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.COMMISSION_NOT_FOUND));
//
//        then(commissionHotelRepository).should(never()).deleteByHotelId(anyInt());
//    }
//
//    @Test
//    void setDefaultCommission_returnsMessage_whenHotelAlreadyUsesDefault() {
//        // GIVEN
//        Hotel hotel = Hotel.builder().hotelId(402).status("ACTIVE").commissionType("DEFAULT").build();
//        Commission defaultCommission = Commission.builder()
//                .commissionId(500L)
//                .commissionType("DEFAULT")
//                .commissionValue(new BigDecimal("7"))
//                .rateType("PERCENT")
//                .build();
//
//        given(hotelRepository.findByHotelIdAndStatus(402, "ACTIVE")).willReturn(Optional.of(hotel));
//        given(commissionRepository.findDefault()).willReturn(Optional.of(defaultCommission));
//
//        // WHEN
//        String result = commissionService.setDefaultCommission(402);
//
//        // THEN
//        assertThat(result).isEqualTo("Hotel đã đang sử dụng DEFAULT commission");
//        then(commissionHotelRepository).should(never()).deleteByHotelId(anyInt());
//        then(hotelRepository).should(never()).save(any(Hotel.class));
//    }
//
//    @Test
//    void setDefaultCommission_success_transitionFromHotelToDefault() {
//        // GIVEN
//        Hotel hotel = Hotel.builder()
//                .hotelId(403)
//                .status("ACTIVE")
//                .commissionType("HOTEL")
//                .commissionId(777L)
//                .build();
//
//        Commission defaultCommission = Commission.builder()
//                .commissionId(600L)
//                .commissionType("DEFAULT")
//                .commissionValue(new BigDecimal("6"))
//                .rateType("PERCENT")
//                .build();
//
//        given(hotelRepository.findByHotelIdAndStatus(403, "ACTIVE")).willReturn(Optional.of(hotel));
//        given(commissionRepository.findDefault()).willReturn(Optional.of(defaultCommission));
//
//        // WHEN
//        String result = commissionService.setDefaultCommission(403);
//
//        // THEN
//        assertThat(result).isEqualTo("Set hotel về DEFAULT commission thành công");
//
//        then(commissionHotelRepository).should().deleteByHotelId(403);
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should().save(hotelCaptor.capture());
//        Hotel updated = hotelCaptor.getValue();
//
//        assertThat(updated.getCommissionId()).isEqualTo(600L);
//        assertThat(updated.getCommissionType()).isEqualTo("DEFAULT");
//        assertThat(updated.getRateType()).isEqualTo("PERCENT");
//        assertThat(updated.getCommissionValue()).isEqualByComparingTo("6");
//        assertThat(updated.getCommissionUpdatedBy()).isEqualTo("test-user-id");
//        assertThat(updated.getCommissionUpdatedAt()).isNotNull();
//    }
//
//    @Test
//    void setDefaultCommission_success_whenCurrentTypeIsNotHotel_shouldNotDeleteMapping() {
//        // GIVEN
//        Hotel hotel = Hotel.builder()
//                .hotelId(404)
//                .status("ACTIVE")
//                .commissionType("DEAL")
//                .build();
//
//        Commission defaultCommission = Commission.builder()
//                .commissionId(700L)
//                .commissionType("DEFAULT")
//                .commissionValue(new BigDecimal("4"))
//                .rateType("FIXED")
//                .build();
//
//        given(hotelRepository.findByHotelIdAndStatus(404, "ACTIVE")).willReturn(Optional.of(hotel));
//        given(commissionRepository.findDefault()).willReturn(Optional.of(defaultCommission));
//
//        // WHEN
//        String result = commissionService.setDefaultCommission(404);
//
//        // THEN
//        assertThat(result).isEqualTo("Set hotel về DEFAULT commission thành công");
//        then(commissionHotelRepository).should(never()).deleteByHotelId(anyInt());
//        then(hotelRepository).should().save(any(Hotel.class));
//    }
//
//    private Jwt buildJwt(String userId) {
//        return Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .build();
//    }
//
//}