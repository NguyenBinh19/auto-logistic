//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.rank.ChangeRankRequest;
//import com.HTPj.htpj.dto.request.rank.RankEvaluateRequest;
//import com.HTPj.htpj.dto.response.rank.AgencyRankChangeResponse;
//import com.HTPj.htpj.dto.response.rank.RankDateResponse;
//import com.HTPj.htpj.entity.*;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.RankMapper;
//import com.HTPj.htpj.mapper.RankPeriodMapper;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.RankServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockedStatic;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeParseException;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.BDDMockito.then;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class RankServiceImplTest {
//
//    @Mock
//    private RankRepository rankRepository;
//
//    @Mock
//    private AgencyRepository agencyRepository;
//
//    @Mock
//    private RankMapper rankMapper;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private SystemConfigRepository systemConfigRepository;
//
//    @Mock
//    private RankPeriodMapper rankPeriodMapper;
//
//    @Mock
//    private AgencyBookingRevenueRepository revenueRepository;
//
//    @Mock
//    private PartnerVerificationRepository partnerVerificationRepository;
//
//    @Mock
//    private RankHistoryRepository rankHistoryRepository;
//
//    @Mock
//    private SystemLogRepository systemLogRepository;
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
//    private RankServiceImpl rankService;
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
//    //getLatestPeriod
//    @Test
//    void getLatestPeriod_success_whenNowIsInSecondPeriod_returnsPeriod1OfCurrentYear() {
//        // GIVEN
//        given(systemConfigRepository.findByConfigCodeIn(anyList())).willReturn(List.of(
//                config("RANK_PERIOD_1_START", "01-01"),
//                config("RANK_PERIOD_1_END", "06-30"),
//                config("RANK_PERIOD_2_START", "07-01"),
//                config("RANK_PERIOD_2_END", "12-31")
//        ));
//
//        LocalDate fixedNow = LocalDate.of(2026, 9, 15);
//
//        try (MockedStatic<LocalDate> localDateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
//            localDateMock.when(LocalDate::now).thenReturn(fixedNow);
//
//            // WHEN
//            RankDateResponse result = rankService.getLatestPeriod();
//
//            // THEN
//            assertThat(result.getStartDate()).isEqualTo(LocalDate.of(2026, 1, 1));
//            assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2026, 6, 30));
//        }
//    }
//
//    @Test
//    void getLatestPeriod_success_whenNowIsInFirstPeriod_returnsPeriod2OfPreviousYear() {
//        // GIVEN
//        given(systemConfigRepository.findByConfigCodeIn(anyList())).willReturn(List.of(
//                config("RANK_PERIOD_1_START", "01-01"),
//                config("RANK_PERIOD_1_END", "06-30"),
//                config("RANK_PERIOD_2_START", "07-01"),
//                config("RANK_PERIOD_2_END", "12-31")
//        ));
//
//        LocalDate fixedNow = LocalDate.of(2026, 2, 10);
//
//        try (MockedStatic<LocalDate> localDateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
//            localDateMock.when(LocalDate::now).thenReturn(fixedNow);
//
//            // WHEN
//            RankDateResponse result = rankService.getLatestPeriod();
//
//            // THEN
//            assertThat(result.getStartDate()).isEqualTo(LocalDate.of(2025, 7, 1));
//            assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2025, 12, 31));
//        }
//    }
//
//    @Test
//    void getLatestPeriod_failure_whenNoPeriodConfigFound_throwsParsingException() {
//        // GIVEN
//        given(systemConfigRepository.findByConfigCodeIn(anyList())).willReturn(List.of());
//
//        LocalDate fixedNow = LocalDate.of(2026, 9, 15);
//
//        try (MockedStatic<LocalDate> localDateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
//            localDateMock.when(LocalDate::now).thenReturn(fixedNow);
//
//            // WHEN / THEN
//            assertThatThrownBy(() -> rankService.getLatestPeriod())
//                    .isInstanceOf(DateTimeParseException.class);
//        }
//    }
//
//    @Test
//    void getLatestPeriod_success_whenNowIsExactlyStartOfSecondPeriod_returnsPeriod1OfCurrentYear() {
//        // GIVEN
//        given(systemConfigRepository.findByConfigCodeIn(anyList())).willReturn(List.of(
//                config("RANK_PERIOD_1_START", "01-01"),
//                config("RANK_PERIOD_1_END", "06-30"),
//                config("RANK_PERIOD_2_START", "07-01"),
//                config("RANK_PERIOD_2_END", "12-31")
//        ));
//
//        LocalDate boundaryDate = LocalDate.of(2026, 7, 1);
//
//        try (MockedStatic<LocalDate> localDateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
//            localDateMock.when(LocalDate::now).thenReturn(boundaryDate);
//
//            // WHEN
//            RankDateResponse result = rankService.getLatestPeriod();
//
//            // THEN
//            assertThat(result.getStartDate()).isEqualTo(LocalDate.of(2026, 1, 1));
//            assertThat(result.getEndDate()).isEqualTo(LocalDate.of(2026, 6, 30));
//        }
//    }
//
//    //getUpgradeCandidates
//    @Test
//    void getUpgradeCandidates_successAndBoundaries_exactOverBelowHighestAndExcluded() {
//        // GIVEN
//        Rank bronze = rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100");
//        Rank silver = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Rank gold = rank(3, "GOLD", "Gold", 3, "1000", "800", true, "300");
//
//        Agency exactMatchAgency = agency(11L, "Exact Match", silver);
//        Agency overMatchAgency = agency(12L, "Over Match", bronze);
//        Agency justBelowAgency = agency(13L, "Just Below", silver);
//        Agency highestRankAgency = agency(14L, "Highest", gold);
//        Agency excludedAgency = agency(15L, "Excluded", bronze);
//
//        RankEvaluateRequest request = evaluateRequest(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30));
//
//        given(agencyRepository.findAllActive()).willReturn(List.of(
//                exactMatchAgency, overMatchAgency, justBelowAgency, highestRankAgency, excludedAgency
//        ));
//        given(rankRepository.findAllActiveOrderByPriorityDesc()).willReturn(List.of(gold, silver, bronze));
//        given(rankHistoryRepository.findAgencyIdsChangedAfter(request.getEndDate().atTime(23, 59, 59)))
//                .willReturn(List.of(15L));
//        given(revenueRepository.getTotalRevenueByAgency(request.getStartDate(), request.getEndDate()))
//                .willReturn(List.of(
//                        new Object[]{11L, new BigDecimal("1000")}, // exact upgrade threshold to GOLD
//                        new Object[]{12L, new BigDecimal("5000")}, // exceeds GOLD threshold
//                        new Object[]{13L, new BigDecimal("999")},  // just below GOLD threshold
//                        new Object[]{14L, new BigDecimal("9999")},
//                        new Object[]{15L, new BigDecimal("2000")}
//                ));
//
//        // WHEN
//        List<AgencyRankChangeResponse> result = rankService.getUpgradeCandidates(request);
//
//        // THEN
//        assertThat(result).hasSize(2);
//        assertThat(result).extracting(AgencyRankChangeResponse::getAgencyId)
//                .containsExactlyInAnyOrder(11L, 12L);
//        assertThat(result).extracting(AgencyRankChangeResponse::getCurrentRank)
//                .containsExactlyInAnyOrder("Silver", "Bronze");
//        assertThat(result).extracting(AgencyRankChangeResponse::getTargetRank)
//                .containsOnly("Gold");
//    }
//
//    @Test
//    void getUpgradeCandidates_empty_whenNoActiveAgencies_returnsEmptyList() {
//        // GIVEN
//        RankEvaluateRequest request = evaluateRequest(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30));
//
//        given(agencyRepository.findAllActive()).willReturn(List.of());
//        given(rankRepository.findAllActiveOrderByPriorityDesc()).willReturn(List.of(
//                rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100")
//        ));
//        given(rankHistoryRepository.findAgencyIdsChangedAfter(any())).willReturn(List.of());
//        given(revenueRepository.getTotalRevenueByAgency(any(), any())).willReturn(List.of());
//
//        // WHEN
//        List<AgencyRankChangeResponse> result = rankService.getUpgradeCandidates(request);
//
//        // THEN
//        assertThat(result).isEmpty();
//    }
//
//    //getDowngradeCandidates
//    @Test
//    void getDowngradeCandidates_successAndBoundaries_belowMaintenanceSafeLowestAndSingleStep() {
//        // GIVEN
//        Rank bronze = rank(1, "BRONZE", "Bronze", 1, "0", "100", true, "100");
//        Rank silver = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Rank gold = rank(3, "GOLD", "Gold", 3, "1000", "800", true, "300");
//
//        Agency belowMaintenance = agency(21L, "Below Maintenance", gold);
//        Agency safeBoundary = agency(22L, "Safe Boundary", silver);
//        Agency lowestRankAgency = agency(23L, "Lowest", bronze);
//        Agency farBelowCurrent = agency(24L, "Far Below", gold);
//
//        RankEvaluateRequest request = evaluateRequest(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30));
//
//        given(agencyRepository.findAllActive()).willReturn(List.of(
//                belowMaintenance, safeBoundary, lowestRankAgency, farBelowCurrent
//        ));
//        given(rankRepository.findAllActiveOrderByPriorityDesc()).willReturn(List.of(gold, silver, bronze));
//        given(rankHistoryRepository.findAgencyIdsChangedAfter(request.getEndDate().atTime(23, 59, 59)))
//                .willReturn(List.of());
//        given(revenueRepository.getTotalRevenueByAgency(request.getStartDate(), request.getEndDate()))
//                .willReturn(List.of(
//                        new Object[]{21L, new BigDecimal("799")}, // below GOLD maintain(800)
//                        new Object[]{22L, new BigDecimal("300")}, // exactly SILVER maintain(300)
//                        new Object[]{23L, new BigDecimal("0")},   // below BRONZE maintain but no lower rank
//                        new Object[]{24L, new BigDecimal("10")}   // far below GOLD -> still one-step downgrade
//                ));
//
//        // WHEN
//        List<AgencyRankChangeResponse> result = rankService.getDowngradeCandidates(request);
//
//        // THEN
//        assertThat(result).hasSize(2);
//        assertThat(result).extracting(AgencyRankChangeResponse::getAgencyId)
//                .containsExactlyInAnyOrder(21L, 24L);
//        assertThat(result).extracting(AgencyRankChangeResponse::getTargetRank)
//                .containsOnly("Silver");
//    }
//
//    @Test
//    void getDowngradeCandidates_excludedAgencies_shouldNotReturn() {
//        // GIVEN
//        Rank silver = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Agency excludedAgency = agency(30L, "Excluded", silver);
//        RankEvaluateRequest request = evaluateRequest(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30));
//        LocalDateTime endDateTime = request.getEndDate().atTime(23, 59, 59);
//
//        given(agencyRepository.findAllActive()).willReturn(List.of(excludedAgency));
//        given(rankRepository.findAllActiveOrderByPriorityDesc()).willReturn(List.of(silver));
//        given(rankHistoryRepository.findAgencyIdsChangedAfter(endDateTime)).willReturn(List.of(30L));
//        given(revenueRepository.getTotalRevenueByAgency(any(), any())).willReturn(List.of());
//
//        // WHEN
//        List<AgencyRankChangeResponse> result = rankService.getDowngradeCandidates(request);
//
//        // THEN
//        assertThat(result).isEmpty();
//    }
//
//    @Test
//    void getDowngradeCandidates_emptyData_shouldReturnEmpty() {
//        // GIVEN
//        RankEvaluateRequest request = evaluateRequest(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30));
//        given(agencyRepository.findAllActive()).willReturn(List.of());
//        given(rankRepository.findAllActiveOrderByPriorityDesc()).willReturn(List.of());
//
//        // WHEN
//        List<AgencyRankChangeResponse> result = rankService.getDowngradeCandidates(request);
//
//        // THEN
//        assertThat(result).isEmpty();
//    }
//
//    //change rank
//    @Test
//    void changeRank_success_approve_updatesAgencySavesHistorySendsNotificationsAndLogs() {
//        // GIVEN
//        Rank currentRank = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Rank targetRank = rank(3, "GOLD", "Gold", 3, "1000", "800", true, "500");
//        Agency agency = agency(31L, "Agency 31", currentRank);
//
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(31L)
//                .currentRankId(2)
//                .targetRankId(3)
//                .totalRevenue(new BigDecimal("1600"))
//                .changeType("UPGRADE")
//                .reason("Reached threshold")
//                .status("APPROVE")
//                .build();
//
//        Users user1 = Users.builder().id("u-1").build();
//        Users user2 = Users.builder().id("u-2").build();
//
//        given(agencyRepository.findById(31L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(2)).willReturn(Optional.of(currentRank));
//        given(rankRepository.findById(3)).willReturn(Optional.of(targetRank));
//        given(userRepository.findByAgency_AgencyId(31L)).willReturn(List.of(user1, user2));
//
//        // WHEN
//        String result = rankService.changeRank(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Change rank successfully");
//        assertThat(agency.getRank()).isEqualTo(targetRank);
//        assertThat(agency.getCreditLimit()).isEqualByComparingTo("500");
//
//        then(agencyRepository).should().save(agency);
//
//        ArgumentCaptor<RankHistory> historyCaptor = ArgumentCaptor.forClass(RankHistory.class);
//        then(rankHistoryRepository).should().save(historyCaptor.capture());
//        RankHistory savedHistory = historyCaptor.getValue();
//        assertThat(savedHistory.getAgency()).isEqualTo(agency);
//        assertThat(savedHistory.getOldRank()).isEqualTo(currentRank);
//        assertThat(savedHistory.getNewRank()).isEqualTo(targetRank);
//        assertThat(savedHistory.getChangeType()).isEqualTo("UPGRADE");
//        assertThat(savedHistory.getTotalRevenueSnapshot()).isEqualByComparingTo("1600");
//        assertThat(savedHistory.getReason()).isEqualTo("Reached threshold");
//        assertThat(savedHistory.getChangedBy()).isEqualTo("test-user-id");
//        assertThat(savedHistory.getChangedAt()).isNotNull();
//
//        then(notificationService).should().sendNotification(
//                eq("u-1"), eq("RANK"), eq("Cập nhật hạng đại lý"),
//                eq("Hạng của đại lý bạn được cập nhật thành GOLD."),
//                eq("RANK"), eq("31"), eq("agency/agency-dashboard")
//        );
//        then(notificationService).should().sendNotification(
//                eq("u-2"), eq("RANK"), eq("Cập nhật hạng đại lý"),
//                eq("Hạng của đại lý bạn được cập nhật thành GOLD."),
//                eq("RANK"), eq("31"), eq("agency/agency-dashboard")
//        );
//
//        ArgumentCaptor<SystemLog> logCaptor = ArgumentCaptor.forClass(SystemLog.class);
//        then(systemLogRepository).should().save(logCaptor.capture());
//        SystemLog savedLog = logCaptor.getValue();
//        assertThat(savedLog.getUserId()).isEqualTo("test-user-id");
//        assertThat(savedLog.getAction()).contains("Agency 31").contains("SILVER").contains("GOLD");
//        assertThat(savedLog.getUpdatedAt()).isNotNull();
//    }
//
//    @Test
//    void changeRank_success_hold_doesNotUpdateAgencyAndUsesHoldChangeType() {
//        // GIVEN
//        Rank currentRank = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Rank targetRank = rank(3, "GOLD", "Gold", 3, "1000", "800", true, "500");
//        Agency agency = agency(32L, "Agency 32", currentRank);
//
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(32L)
//                .currentRankId(2)
//                .targetRankId(3)
//                .totalRevenue(new BigDecimal("900"))
//                .changeType("UPGRADE")
//                .reason("Manual review")
//                .status("HOLD")
//                .build();
//
//        given(agencyRepository.findById(32L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(2)).willReturn(Optional.of(currentRank));
//        given(rankRepository.findById(3)).willReturn(Optional.of(targetRank));
//        given(userRepository.findByAgency_AgencyId(32L)).willReturn(List.of(Users.builder().id("u-32").build()));
//
//        // WHEN
//        String result = rankService.changeRank(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Change rank successfully");
//        assertThat(agency.getRank()).isEqualTo(currentRank);
//
//        then(agencyRepository).should(never()).save(any(Agency.class));
//
//        ArgumentCaptor<RankHistory> historyCaptor = ArgumentCaptor.forClass(RankHistory.class);
//        then(rankHistoryRepository).should().save(historyCaptor.capture());
//        assertThat(historyCaptor.getValue().getChangeType()).isEqualTo("HOLD");
//
//        then(notificationService).should().sendNotification(
//                eq("u-32"), eq("RANK"), eq("Cập nhật hạng đại lý"),
//                eq("Hạng của đại lý bạn được giữ nguyên thành GOLD."),
//                eq("RANK"), eq("32"), eq("agency/agency-dashboard")
//        );
//    }
//
//    @Test
//    void changeRank_failure_whenAgencyNotFound_throwsRuntimeException() {
//        // GIVEN
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(99L)
//                .currentRankId(1)
//                .targetRankId(2)
//                .status("APPROVE")
//                .build();
//        given(agencyRepository.findById(99L)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> rankService.changeRank(request))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessage("Agency not found");
//
//        then(rankHistoryRepository).should(never()).save(any(RankHistory.class));
//        then(notificationService).should(never()).sendNotification(
//                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()
//        );
//    }
//
//    @Test
//    void changeRank_failure_whenCurrentRankNotFound_throwsAppException() {
//        // GIVEN
//        Agency agency = agency(40L, "Agency 40", null);
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(40L)
//                .currentRankId(100)
//                .targetRankId(2)
//                .status("APPROVE")
//                .build();
//        given(agencyRepository.findById(40L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(100)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> rankService.changeRank(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.RANK_NOT_FOUND));
//
//        then(rankHistoryRepository).should(never()).save(any(RankHistory.class));
//    }
//
//    @Test
//    void changeRank_failure_whenTargetRankNotFound_throwsAppException() {
//        // GIVEN
//        Rank currentRank = rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100");
//        Agency agency = agency(41L, "Agency 41", currentRank);
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(41L)
//                .currentRankId(1)
//                .targetRankId(200)
//                .status("APPROVE")
//                .build();
//
//        given(agencyRepository.findById(41L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(1)).willReturn(Optional.of(currentRank));
//        given(rankRepository.findById(200)).willReturn(Optional.empty());
//
//        // WHEN / THEN
//        assertThatThrownBy(() -> rankService.changeRank(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.RANK_NOT_FOUND));
//
//        then(rankHistoryRepository).should(never()).save(any(RankHistory.class));
//    }
//
//    @Test
//    void changeRank_abnormal_upgradeTypeButLowerTargetRank_stillProcessesBecauseNoValidation() {
//        // GIVEN
//        Rank gold = rank(3, "GOLD", "Gold", 3, "1000", "800", true, "500");
//        Rank bronze = rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100");
//        Agency agency = agency(50L, "Agency 50", gold);
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(50L)
//                .currentRankId(3)
//                .targetRankId(1)
//                .totalRevenue(new BigDecimal("1500"))
//                .changeType("UPGRADE")
//                .reason("Manual override")
//                .status("APPROVE")
//                .build();
//
//        given(agencyRepository.findById(50L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(3)).willReturn(Optional.of(gold));
//        given(rankRepository.findById(1)).willReturn(Optional.of(bronze));
//        given(userRepository.findByAgency_AgencyId(50L)).willReturn(List.of());
//
//        // WHEN
//        String result = rankService.changeRank(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Change rank successfully");
//        assertThat(agency.getRank()).isEqualTo(bronze);
//        then(agencyRepository).should().save(agency);
//
//        ArgumentCaptor<RankHistory> historyCaptor = ArgumentCaptor.forClass(RankHistory.class);
//        then(rankHistoryRepository).should().save(historyCaptor.capture());
//        assertThat(historyCaptor.getValue().getChangeType()).isEqualTo("UPGRADE");
//    }
//
//    @Test
//    void changeRank_success_rejectStatus_setsHoldType() {
//        // GIVEN
//        Rank current = rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100");
//        Rank target = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Agency agency = agency(60L, "Agency 60", current);
//
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(60L)
//                .currentRankId(1)
//                .targetRankId(2)
//                .status("REJECT")
//                .build();
//
//        given(agencyRepository.findById(60L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(1)).willReturn(Optional.of(current));
//        given(rankRepository.findById(2)).willReturn(Optional.of(target));
//        given(userRepository.findByAgency_AgencyId(60L)).willReturn(List.of());
//
//        // WHEN
//        String result = rankService.changeRank(request);
//
//        // THEN
//        assertThat(result).isEqualTo("Change rank successfully");
//        ArgumentCaptor<RankHistory> historyCaptor = ArgumentCaptor.forClass(RankHistory.class);
//        then(rankHistoryRepository).should().save(historyCaptor.capture());
//        assertThat(historyCaptor.getValue().getChangeType()).isEqualTo("HOLD"); // Mặc định về HOLD
//        then(agencyRepository).should(never()).save(any(Agency.class));
//    }
//
//    @Test
//    void changeRank_success_noUsers_doesNotSendNotifications() {
//        // GIVEN
//        Rank current = rank(1, "BRONZE", "Bronze", 1, "0", "0", true, "100");
//        Rank target = rank(2, "SILVER", "Silver", 2, "500", "300", true, "200");
//        Agency agency = agency(70L, "Agency 70", current);
//
//        ChangeRankRequest request = ChangeRankRequest.builder()
//                .agencyId(70L).currentRankId(1).targetRankId(2).status("APPROVE").build();
//
//        given(agencyRepository.findById(70L)).willReturn(Optional.of(agency));
//        given(rankRepository.findById(1)).willReturn(Optional.of(current));
//        given(rankRepository.findById(2)).willReturn(Optional.of(target));
//        given(userRepository.findByAgency_AgencyId(70L)).willReturn(Collections.emptyList());
//
//        // WHEN
//        rankService.changeRank(request);
//
//        // THEN
//        then(notificationService).should(never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    private RankEvaluateRequest evaluateRequest(LocalDate start, LocalDate end) {
//        return RankEvaluateRequest.builder()
//                .startDate(start)
//                .endDate(end)
//                .build();
//    }
//
//    private SystemConfig config(String code, String value) {
//        return SystemConfig.builder()
//                .configCode(code)
//                .configValue(value)
//                .build();
//    }
//
//    private Agency agency(Long id, String name, Rank rank) {
//        return Agency.builder()
//                .agencyId(id)
//                .agencyName(name)
//                .email(name.replace(" ", "").toLowerCase() + "@example.com")
//                .rank(rank)
//                .status("ACTIVE")
//                .build();
//    }
//
//    private Rank rank(Integer id, String code, String name, Integer priority,
//                      String upgradeMinRevenue, String maintainMinRevenue,
//                      boolean active, String creditLimit) {
//        return Rank.builder()
//                .id(id)
//                .rankCode(code)
//                .rankName(name)
//                .priority(priority)
//                .upgradeMinTotalRevenue(new BigDecimal(upgradeMinRevenue))
//                .maintainMinRevenue(new BigDecimal(maintainMinRevenue))
//                .isActive(active)
//                .creditLimit(new BigDecimal(creditLimit))
//                .build();
//    }
//
//    private Jwt buildJwt(String userId) {
//        return Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .build();
//    }
//}