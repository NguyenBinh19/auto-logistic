//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.DataSourceResponse.transaction.CreditSummaryDto;
//import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
//import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
//import com.HTPj.htpj.dto.response.agency.AgencyUserBookingResponse;
//import com.HTPj.htpj.entity.Agency;
//import com.HTPj.htpj.entity.AgencyBooking;
//import com.HTPj.htpj.entity.Booking;
//import com.HTPj.htpj.entity.PartnerVerification;
//import com.HTPj.htpj.entity.TransactionHistory;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.AgencyMapper;
//import com.HTPj.htpj.repository.AgencyBookingRepository;
//import com.HTPj.htpj.repository.AgencyRepository;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.PartnerVerificationRepository;
//import com.HTPj.htpj.repository.TransactionHistoryRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.AgencyServiceImpl;
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
//import java.time.LocalDateTime;
//import java.time.YearMonth;
//import java.util.Collections;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.function.Function;
//import java.util.stream.Collectors;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.BDDMockito.then;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class AgencyServiceImplTest {
//
//    @Mock
//    private AgencyRepository agencyRepository;
//
//    @Mock
//    private PartnerVerificationRepository verificationRepository;
//
//    @Mock
//    private AgencyMapper agencyMapper;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private AgencyBookingRepository agencyBookingRepository;
//
//    @Mock
//    private TransactionHistoryRepository transactionHistoryRepository;
//
//    @Mock
//    private BookingRepository bookingRepository;
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
//    private AgencyServiceImpl agencyService;
//
//    @BeforeEach
//    void setUpSecurityContext() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//    }
//
//    @AfterEach
//    void clearSecurityContext() {
//        SecurityContextHolder.clearContext();
//    }
//
//    //update
//    @Test
//    void updateAgency_success_updatesFieldsSavesAndNotifiesManagers() {
//        Long agencyId = 1L;
//        String userId = "agency-manager";
//
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .agencyName("Old Name")
//                .email("old@agency.com")
//                .hotline("0900")
//                .contactPhone("0901")
//                .build();
//
//        UpdateAgencyRequest request = UpdateAgencyRequest.builder()
//                .agencyName("New Name")
//                .email("new@agency.com")
//                .hotline("0902")
//                .contactPhone("0903")
//                .build();
//
//        PartnerVerification verification = PartnerVerification.builder().version(1).build();
//        AgencyDetailResponse mappedResponse = AgencyDetailResponse.builder()
//                .agencyId(agencyId)
//                .agencyName("New Name")
//                .email("new@agency.com")
//                .build();
//
//        mockAuthenticatedAgencyUser(userId, agencyId);
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyRepository.existsByEmail("new@agency.com")).willReturn(false);
//        given(verificationRepository.findVerifiedByAgencyOrderByVersionDesc(agencyId)).willReturn(List.of(verification));
//        given(agencyMapper.toAgencyDetailResponse(agency, verification)).willReturn(mappedResponse);
//
//        Users manager1 = Users.builder().id("m-1").build();
//        Users manager2 = Users.builder().id("m-2").build();
//        given(userRepository.findByAgency_AgencyId(agencyId)).willReturn(List.of(manager1, manager2));
//
//        AgencyDetailResponse result = agencyService.updateAgency(request);
//
//        assertThat(result).isSameAs(mappedResponse);
//
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        then(agencyRepository).should().save(agencyCaptor.capture());
//        Agency savedAgency = agencyCaptor.getValue();
//
//        assertThat(savedAgency.getAgencyName()).isEqualTo("New Name");
//        assertThat(savedAgency.getEmail()).isEqualTo("new@agency.com");
//        assertThat(savedAgency.getHotline()).isEqualTo("0902");
//        assertThat(savedAgency.getContactPhone()).isEqualTo("0903");
//        assertThat(savedAgency.getUpdatedAt()).isNotNull();
//
//        then(notificationService).should().sendNotification(
//                eq("m-1"), eq("AGENCY"),
//                eq("Thông tin đại lý đã được cập nhật"),
//                eq("Thông tin của đại lý New Name vừa được cập nhật."),
//                eq("AGENCY"), eq("1"), eq("/agency/profile")
//        );
//        then(notificationService).should().sendNotification(
//                eq("m-2"), eq("AGENCY"),
//                eq("Thông tin đại lý đã được cập nhật"),
//                eq("Thông tin của đại lý New Name vừa được cập nhật."),
//                eq("AGENCY"), eq("1"), eq("/agency/profile")
//        );
//    }
//
//    @Test
//    void updateAgency_throwsAgencyNotFound_whenAgencyDoesNotExist() {
//        Long agencyId = 2L;
//        mockAuthenticatedAgencyUser("u-2", agencyId);
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.empty());
//
//        assertThatThrownBy(() -> agencyService.updateAgency(UpdateAgencyRequest.builder().email("new@mail.com").build()))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.AGENCY_NOT_FOUND));
//
//        then(agencyRepository).should(never()).save(any(Agency.class));
//        then(notificationService).should(never()).sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void updateAgency_throwsEmailAlreadyExists_whenEmailBelongsToAnotherAgency() {
//        Long agencyId = 3L;
//        mockAuthenticatedAgencyUser("u-3", agencyId);
//
//        Agency agency = Agency.builder().agencyId(agencyId).email("old@mail.com").build();
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyRepository.existsByEmail("dup@mail.com")).willReturn(true);
//
//        UpdateAgencyRequest request = UpdateAgencyRequest.builder()
//                .email("dup@mail.com")
//                .agencyName("Agency")
//                .hotline("0909")
//                .contactPhone("0910")
//                .build();
//
//        assertThatThrownBy(() -> agencyService.updateAgency(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS));
//
//        then(agencyRepository).should(never()).save(any(Agency.class));
//        then(notificationService).should(never()).sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void updateAgency_success_whenEmailIsUnchanged() {
//        // GIVEN
//        Long agencyId = 4L;
//        String currentEmail = "same@agency.com";
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .agencyName("Old Name")
//                .email(currentEmail)
//                .build();
//
//        UpdateAgencyRequest request = UpdateAgencyRequest.builder()
//                .agencyName("New Name")
//                .email(currentEmail)
//                .hotline("0888")
//                .contactPhone("0999")
//                .build();
//
//        AgencyDetailResponse mappedResponse = AgencyDetailResponse.builder()
//                .agencyId(agencyId)
//                .agencyName("New Name")
//                .email(currentEmail)
//                .build();
//
//        mockAuthenticatedAgencyUser("u-4", agencyId);
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//
//        PartnerVerification verification = PartnerVerification.builder().version(1).build();
//        given(verificationRepository.findVerifiedByAgencyOrderByVersionDesc(agencyId)).willReturn(List.of(verification));
//        given(agencyMapper.toAgencyDetailResponse(any(), any())).willReturn(mappedResponse);
//        given(userRepository.findByAgency_AgencyId(agencyId)).willReturn(List.of());
//
//        // WHEN
//        AgencyDetailResponse result = agencyService.updateAgency(request);
//
//        // THEN
//        assertThat(result.getEmail()).isEqualTo(currentEmail);
//        then(agencyRepository).should().save(any(Agency.class));
//        then(agencyRepository).should(never()).existsByEmail(anyString());
//    }
//
//    @Test
//    void updateAgency_boundary_emptyFields_savesSuccessfully() {
//        // GIVEN
//        Long agencyId = 5L;
//        Agency agency = Agency.builder().agencyId(agencyId).email("test@mail.com").build();
//        UpdateAgencyRequest request = UpdateAgencyRequest.builder()
//                .agencyName("")
//                .email("test@mail.com")
//                .hotline("")
//                .contactPhone("")
//                .build();
//
//        PartnerVerification verification = PartnerVerification.builder().version(1).build();
//
//        mockAuthenticatedAgencyUser("u-5", agencyId);
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//
//        given(verificationRepository.findVerifiedByAgencyOrderByVersionDesc(agencyId))
//                .willReturn(List.of(verification));
//
//        given(userRepository.findByAgency_AgencyId(agencyId)).willReturn(List.of());
//        given(agencyMapper.toAgencyDetailResponse(any(), any())).willReturn(AgencyDetailResponse.builder().build());
//
//        // WHEN
//        agencyService.updateAgency(request);
//
//        // THEN
//        ArgumentCaptor<Agency> captor = ArgumentCaptor.forClass(Agency.class);
//        then(agencyRepository).should().save(captor.capture());
//        assertThat(captor.getValue().getAgencyName()).isEmpty();
//        assertThat(captor.getValue().getHotline()).isEmpty();
//    }
//
//    //findAgencyFinanceInfoHeader
//    @Test
//    void findAgencyFinanceInfoHeader_calculatesUsedPercent_whenCreditLimitGreaterThanZero() {
//        Agency agency = Agency.builder()
//                .agencyId(10L)
//                .walletBalance(new BigDecimal("500"))
//                .creditLimit(new BigDecimal("1000"))
//                .currentCredit(new BigDecimal("250"))
//                .build();
//
//        given(agencyRepository.findAgenciesFinanceInfo(10L)).willReturn(agency);
//
//        AgencyDetailResponse result = agencyService.findAgencyFinanceInfoHeader(10L);
//
//        assertThat(result.getAgencyId()).isEqualTo(10L);
//        assertThat(result.getWalletBalance()).isEqualByComparingTo("500");
//        assertThat(result.getCreditLimit()).isEqualByComparingTo("1000");
//        assertThat(result.getCurrentCredit()).isEqualByComparingTo("250");
//        assertThat(result.getCreditUsedPercent()).isEqualTo(25);
//    }
//
//    @Test
//    void findAgencyFinanceInfoHeader_returnsZeroPercent_whenCreditLimitIsZeroOrNull() {
//        Agency zeroLimitAgency = Agency.builder()
//                .agencyId(11L)
//                .walletBalance(new BigDecimal("300"))
//                .creditLimit(BigDecimal.ZERO)
//                .currentCredit(new BigDecimal("100"))
//                .build();
//        given(agencyRepository.findAgenciesFinanceInfo(11L)).willReturn(zeroLimitAgency);
//
//        AgencyDetailResponse zeroResult = agencyService.findAgencyFinanceInfoHeader(11L);
//        assertThat(zeroResult.getCreditUsedPercent()).isZero();
//
//        Agency nullLimitAgency = Agency.builder()
//                .agencyId(12L)
//                .walletBalance(new BigDecimal("200"))
//                .creditLimit(null)
//                .currentCredit(new BigDecimal("80"))
//                .build();
//        given(agencyRepository.findAgenciesFinanceInfo(12L)).willReturn(nullLimitAgency);
//
//        AgencyDetailResponse nullResult = agencyService.findAgencyFinanceInfoHeader(12L);
//        assertThat(nullResult.getCreditUsedPercent()).isZero();
//        assertThat(nullResult.getAgencyId()).isEqualTo(12L);
//        assertThat(nullResult.getWalletBalance()).isEqualByComparingTo("200");
//    }
//
//    @Test
//    void findAgencyFinanceInfoHeader_roundsHalfUp_whenPercentHasDecimal() {
//        // GIVEN
//        Agency agency = Agency.builder()
//                .agencyId(13L)
//                .creditLimit(new BigDecimal("300"))
//                .currentCredit(new BigDecimal("200"))
//                .build();
//
//        given(agencyRepository.findAgenciesFinanceInfo(13L)).willReturn(agency);
//
//        // WHEN
//        AgencyDetailResponse result = agencyService.findAgencyFinanceInfoHeader(13L);
//
//        // THEN
//        assertThat(result.getCreditUsedPercent()).isEqualTo(67);
//    }
//
//    @Test
//    void findAgencyFinanceInfoHeader_handlesNullFields_gracefully() {
//        // GIVEN
//        Agency agency = Agency.builder()
//                .agencyId(14L)
//                .walletBalance(null)
//                .creditLimit(new BigDecimal("1000"))
//                .currentCredit(null)
//                .build();
//
//        given(agencyRepository.findAgenciesFinanceInfo(14L)).willReturn(agency);
//
//        // WHEN & THEN
//       assertThatThrownBy(() -> agencyService.findAgencyFinanceInfoHeader(14L))
//                .isInstanceOf(NullPointerException.class);
//    }
//
//    //getCreditSummary
//    @Test
//    void getCreditSummary_sumsDebtAndHandlesNullValuesAndBuildsDueDate() {
//        Long agencyId = 20L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .creditLimit(new BigDecimal("1000"))
//                .currentCredit(new BigDecimal("250"))
//                .build();
//
//        AgencyBooking b1 = AgencyBooking.builder()
//                .principalRemaining(new BigDecimal("100"))
//                .penaltyInterest(new BigDecimal("10"))
//                .build();
//        AgencyBooking b2 = AgencyBooking.builder()
//                .principalRemaining(null)
//                .penaltyInterest(new BigDecimal("5"))
//                .build();
//        AgencyBooking b3 = AgencyBooking.builder()
//                .principalRemaining(new BigDecimal("15"))
//                .penaltyInterest(null)
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId)).willReturn(List.of(b1, b2, b3));
//
//        CreditSummaryDto result = agencyService.getCreditSummary(agencyId);
//
//        assertThat(result.remainingCredit()).isEqualByComparingTo("250");
//        assertThat(result.debt()).isEqualByComparingTo("130");
//        assertThat(result.creditLimit()).isEqualByComparingTo("1000");
//        assertThat(result.usedPercent()).isEqualTo(13);
//        assertThat(result.dueDate()).isEqualTo(YearMonth.now().atDay(25));
//    }
//
//    @Test
//    void getCreditSummary_setsUsedPercentToZero_whenCreditLimitIsZero() {
//        Long agencyId = 21L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .creditLimit(BigDecimal.ZERO)
//                .currentCredit(new BigDecimal("500"))
//                .build();
//
//        AgencyBooking debt = AgencyBooking.builder()
//                .principalRemaining(new BigDecimal("200"))
//                .penaltyInterest(new BigDecimal("50"))
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId)).willReturn(List.of(debt));
//
//        CreditSummaryDto result = agencyService.getCreditSummary(agencyId);
//
//        assertThat(result.usedPercent()).isZero();
//        assertThat(result.dueDate()).isEqualTo(LocalDate.now().withDayOfMonth(25));
//    }
//
//    @Test
//    void getCreditSummary_throwsRuntimeException_whenAgencyNotFound() {
//        given(agencyRepository.findById(99L)).willReturn(Optional.empty());
//
//        assertThatThrownBy(() -> agencyService.getCreditSummary(99L))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessage("Agency not found");
//    }
//
//    @Test
//    void getCreditSummary_handlesNullAgencyCredits_returnsZeroValues() {
//        // GIVEN
//        Long agencyId = 22L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .creditLimit(null)
//                .currentCredit(null)
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId)).willReturn(List.of());
//
//        // WHEN
//        CreditSummaryDto result = agencyService.getCreditSummary(agencyId);
//
//        // THEN
//        assertThat(result.remainingCredit()).isEqualByComparingTo(BigDecimal.ZERO);
//        assertThat(result.debt()).isEqualByComparingTo(BigDecimal.ZERO);
//        assertThat(result.creditLimit()).isEqualByComparingTo(BigDecimal.ZERO);
//        assertThat(result.usedPercent()).isZero();
//        assertThat(result.dueDate()).isEqualTo(YearMonth.now().atDay(25));
//    }
//
//    //payDebt
//    @Test
//    void payDebt_throwsIllegalArgumentException_whenPaymentIsNull() {
//        assertThatThrownBy(() -> agencyService.payDebt(1L, null))
//                .isInstanceOf(IllegalArgumentException.class)
//                .hasMessage("Số tiền thanh toán không được null");
//    }
//
//    @Test
//    void payDebt_throwsRuntimeException_whenNoUnpaidBookings() {
//        Long agencyId = 30L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .walletBalance(new BigDecimal("1000"))
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId)).willReturn(Collections.emptyList());
//
//        assertThatThrownBy(() -> agencyService.payDebt(agencyId, new BigDecimal("100")))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessage("Không có nợ cần thanh toán");
//    }
//
//    @Test
//    void payDebt_throwsRuntimeException_whenWalletBalanceInsufficient() {
//        Long agencyId = 31L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .walletBalance(new BigDecimal("50"))
//                .build();
//
//        AgencyBooking booking = AgencyBooking.builder()
//                .penaltyInterest(new BigDecimal("10"))
//                .principalRemaining(new BigDecimal("100"))
//                .isPaid(false)
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId)).willReturn(List.of(booking));
//
//        assertThatThrownBy(() -> agencyService.payDebt(agencyId, new BigDecimal("60")))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessage("Số dư ví không đủ để thanh toán nợ");
//    }
//
//    @Test
//    void payDebt_appliesPenaltyFirstThenPrincipal_restoresCreditByPrincipalOnly_andSavesHistoryTwice() {
//        Long agencyId = 32L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .walletBalance(new BigDecimal("500"))
//                .currentCredit(new BigDecimal("200"))
//                .build();
//
//        AgencyBooking booking = AgencyBooking.builder()
//                .id(100L)
//                .agencyId(agencyId)
//                .penaltyInterest(new BigDecimal("30"))
//                .principalRemaining(new BigDecimal("100"))
//                .isPaid(false)
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId))
//                .willReturn(List.of(booking), List.of(booking));
//        given(agencyRepository.save(any(Agency.class))).willAnswer(invocation -> invocation.getArgument(0));
//
//        given(transactionHistoryRepository.save(any(TransactionHistory.class))).willAnswer(invocation -> {
//            TransactionHistory history = invocation.getArgument(0);
//            if (history.getId() == null) {
//                history.setId(15L);
//            }
//            return history;
//        });
//
//        given(userRepository.findByAgency_AgencyId(agencyId))
//                .willReturn(List.of(Users.builder().id("manager-1").build()));
//
//        agencyService.payDebt(agencyId, new BigDecimal("80"));
//
//        ArgumentCaptor<AgencyBooking> bookingCaptor = ArgumentCaptor.forClass(AgencyBooking.class);
//        then(agencyBookingRepository).should().save(bookingCaptor.capture());
//        AgencyBooking savedBooking = bookingCaptor.getValue();
//        assertThat(savedBooking.getPenaltyInterest()).isEqualByComparingTo("0");
//        assertThat(savedBooking.getPrincipalRemaining()).isEqualByComparingTo("50");
//        assertThat(savedBooking.getIsPaid()).isFalse();
//        assertThat(savedBooking.getUpdatedAt()).isNotNull();
//
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        then(agencyRepository).should().save(agencyCaptor.capture());
//        Agency savedAgency = agencyCaptor.getValue();
//        assertThat(savedAgency.getWalletBalance()).isEqualByComparingTo("420");
//        assertThat(savedAgency.getCurrentCredit()).isEqualByComparingTo("250");
//
//        ArgumentCaptor<TransactionHistory> historyCaptor = ArgumentCaptor.forClass(TransactionHistory.class);
//        then(transactionHistoryRepository).should(times(2)).save(historyCaptor.capture());
//        List<TransactionHistory> histories = historyCaptor.getAllValues();
//        assertThat(histories.get(0).getTransactionDate()).isNotNull();
//        assertThat(histories.get(0).getCreatedAt()).isNotNull();
//        assertThat(histories.get(0).getAmount()).isEqualByComparingTo("80");
//        assertThat(histories.get(1).getTransactionCode()).isEqualTo("TRK-000015");
//
//        then(notificationService).should().sendNotification(
//                eq("manager-1"), eq("PAYMENT"),
//                eq("Thanh toán dư nợ thành công"),
//                eq("Đại lý đã thanh toán dư nợ 80 VND."),
//                eq("AGENCY"), eq("32"), eq("/agency/financial")
//        );
//    }
//
//    @Test
//    void payDebt_marksBookingPaidOnlyWhenPenaltyAndPrincipalAreZero() {
//        Long agencyId = 33L;
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .walletBalance(new BigDecimal("300"))
//                .currentCredit(new BigDecimal("100"))
//                .build();
//
//        AgencyBooking booking = AgencyBooking.builder()
//                .id(101L)
//                .agencyId(agencyId)
//                .penaltyInterest(new BigDecimal("20"))
//                .principalRemaining(new BigDecimal("100"))
//                .isPaid(false)
//                .build();
//
//        given(agencyRepository.findById(agencyId)).willReturn(Optional.of(agency));
//        given(agencyBookingRepository.findByAgencyIdAndIsPaidFalse(agencyId))
//                .willReturn(List.of(booking), Collections.emptyList());
//        given(agencyRepository.save(any(Agency.class))).willAnswer(invocation -> invocation.getArgument(0));
//        given(transactionHistoryRepository.save(any(TransactionHistory.class))).willAnswer(invocation -> {
//            TransactionHistory history = invocation.getArgument(0);
//            if (history.getId() == null) {
//                history.setId(16L);
//            }
//            return history;
//        });
//        given(userRepository.findByAgency_AgencyId(agencyId)).willReturn(Collections.emptyList());
//
//        agencyService.payDebt(agencyId, new BigDecimal("120"));
//
//        ArgumentCaptor<AgencyBooking> bookingCaptor = ArgumentCaptor.forClass(AgencyBooking.class);
//        then(agencyBookingRepository).should().save(bookingCaptor.capture());
//        AgencyBooking savedBooking = bookingCaptor.getValue();
//
//        assertThat(savedBooking.getPenaltyInterest()).isEqualByComparingTo("0");
//        assertThat(savedBooking.getPrincipalRemaining()).isEqualByComparingTo("0");
//        assertThat(savedBooking.getIsPaid()).isTrue();
//
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        then(agencyRepository).should().save(agencyCaptor.capture());
//        assertThat(agencyCaptor.getValue().getCurrentCredit()).isEqualByComparingTo("200");
//    }
//
//    //getAgencyUserBookingSummary_
//    @Test
//    void getAgencyUserBookingSummary_returnsEmptyList_whenNoBookings() {
//        Long agencyId = 40L;
//        mockAuthenticatedAgencyUser("agency-user-40", agencyId);
//        given(bookingRepository.findByAgencyId(agencyId)).willReturn(Collections.emptyList());
//
//        List<AgencyUserBookingResponse> result = agencyService.getAgencyUserBookingSummary();
//
//        assertThat(result).isEmpty();
//    }
//
//    @Test
//    void getAgencyUserBookingSummary_groupsByUser_calculatesMoneyUsage_andHandlesMissingUserData() {
//        Long agencyId = 41L;
//        mockAuthenticatedAgencyUser("agency-user-41", agencyId);
//
//        Booking b1 = Booking.builder()
//                .bookingId(1L)
//                .userId("u1")
//                .bookingStatus("BOOKED")
//                .finalAmount(new BigDecimal("200"))
//                .refundAmount(new BigDecimal("20"))
//                .build();
//        Booking b2 = Booking.builder()
//                .bookingId(2L)
//                .userId("u1")
//                .bookingStatus("COMPLETED")
//                .finalAmount(new BigDecimal("100"))
//                .refundAmount(null)
//                .build();
//        Booking b3 = Booking.builder()
//                .bookingId(3L)
//                .userId("u2")
//                .bookingStatus("CANCELLED")
//                .finalAmount(new BigDecimal("150"))
//                .refundAmount(new BigDecimal("50"))
//                .build();
//
//        given(bookingRepository.findByAgencyId(agencyId)).willReturn(List.of(b1, b2, b3));
//        given(userRepository.findAllById(any())).willReturn(List.of(
//                Users.builder().id("u1").username("user-one").firstName("First").lastName("Last").build()
//        ));
//
//        List<AgencyUserBookingResponse> result = agencyService.getAgencyUserBookingSummary();
//
//        assertThat(result).hasSize(2);
//
//        Map<String, AgencyUserBookingResponse> byUser = result.stream()
//                .collect(Collectors.toMap(AgencyUserBookingResponse::getUserId, Function.identity()));
//
//        AgencyUserBookingResponse u1 = byUser.get("u1");
//        assertThat(u1.getUsername()).isEqualTo("user-one");
//        assertThat(u1.getFullName()).isEqualTo("First Last");
//        assertThat(u1.getTotalBooking()).isEqualTo(2);
//        assertThat(u1.getTotalMoneyUsage()).isEqualByComparingTo("280");
//
//        AgencyUserBookingResponse u2 = byUser.get("u2");
//        assertThat(u2.getUsername()).isNull();
//        assertThat(u2.getFullName()).isNull();
//        assertThat(u2.getTotalBooking()).isEqualTo(1);
//        assertThat(u2.getTotalMoneyUsage()).isEqualByComparingTo("100");
//    }
//
//    @Test
//    void getAgencyUserBookingSummary_throwsUserNotExisted_whenAuthenticatedUserMissing() {
//        given(authentication.getPrincipal()).willReturn(buildJwt("missing-user"));
//        given(userRepository.findById("missing-user")).willReturn(Optional.empty());
//
//        assertThatThrownBy(() -> agencyService.getAgencyUserBookingSummary())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED));
//    }
//
//    @Test
//    void getAgencyUserBookingSummary_throwsAgencyNotFound_whenCurrentUserHasNoAgency() {
//        String userId = "user-without-agency";
//        given(authentication.getPrincipal()).willReturn(buildJwt(userId));
//        given(userRepository.findById(userId)).willReturn(Optional.of(Users.builder().id(userId).agency(null).build()));
//
//        assertThatThrownBy(() -> agencyService.getAgencyUserBookingSummary())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.AGENCY_NOT_FOUND));
//    }
//
//    @Test
//    void getAgencyUserBookingSummary_calculatesCorrectly_whenAmountsAreZeroOrEdgeCases() {
//        // GIVEN
//        Long agencyId = 42L;
//        String userId = "u3";
//        mockAuthenticatedAgencyUser("agency-user-42", agencyId);
//
//        Booking b1 = Booking.builder()
//                .bookingId(10L)
//                .userId(userId)
//                .bookingStatus("CANCELLED")
//                .finalAmount(BigDecimal.ZERO)
//                .refundAmount(BigDecimal.ZERO)
//                .build();
//
//        Booking b2 = Booking.builder()
//                .bookingId(11L)
//                .userId(userId)
//                .bookingStatus("REFUNDED")
//                .finalAmount(new BigDecimal("100"))
//                .refundAmount(new BigDecimal("100"))
//                .build();
//
//        given(bookingRepository.findByAgencyId(agencyId)).willReturn(List.of(b1, b2));
//        given(userRepository.findAllById(any())).willReturn(List.of(
//                Users.builder().id(userId).username("edge-user").build()
//        ));
//
//        // WHEN
//        List<AgencyUserBookingResponse> result = agencyService.getAgencyUserBookingSummary();
//
//        // THEN
//        assertThat(result).hasSize(1);
//        AgencyUserBookingResponse response = result.get(0);
//        assertThat(response.getTotalMoneyUsage()).isEqualByComparingTo(BigDecimal.ZERO);
//        assertThat(response.getBookings()).hasSize(2);
//        assertThat(response.getBookings().get(0).getPaymentAmount()).isEqualByComparingTo(BigDecimal.ZERO);
//        assertThat(response.getBookings().get(1).getPaymentAmount()).isEqualByComparingTo(BigDecimal.ZERO);
//    }
//
//    private void mockAuthenticatedAgencyUser(String userId, Long agencyId) {
//        given(authentication.getPrincipal()).willReturn(buildJwt(userId));
//
//        Agency agency = Agency.builder().agencyId(agencyId).build();
//        Users user = Users.builder().id(userId).agency(agency).build();
//
//        given(userRepository.findById(userId)).willReturn(Optional.of(user));
//    }
//
//    private Jwt buildJwt(String userId) {
//        return Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .build();
//    }
//}
//
