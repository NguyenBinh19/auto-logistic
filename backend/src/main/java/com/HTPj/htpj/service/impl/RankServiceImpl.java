package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.rank.*;
import com.HTPj.htpj.dto.response.rank.*;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RankMapper;
import com.HTPj.htpj.mapper.RankPeriodMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.RankService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RankServiceImpl implements RankService {

    RankRepository rankRepository;
    AgencyRepository agencyRepository;
    RankMapper rankMapper;
    UserRepository userRepository;
    SystemConfigRepository systemConfigRepository;
    RankPeriodMapper rankPeriodMapper;
    AgencyBookingRevenueRepository revenueRepository;
    PartnerVerificationRepository partnerVerificationRepository;
    RankHistoryRepository rankHistoryRepository;
    SystemLogRepository systemLogRepository;
    NotificationService notificationService;

    public enum RankPeriodType {
        RANK_PERIOD_1_START,
        RANK_PERIOD_1_END,
        RANK_PERIOD_2_START,
        RANK_PERIOD_2_END
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        return jwt.getClaim("userId");
    }

    private void saveLog(String action) {
        SystemLog log = new SystemLog();
        log.setUserId(getCurrentUserId());
        log.setAction(action);
        log.setUpdatedAt(LocalDateTime.now());

        systemLogRepository.save(log);
    }

    private String getUsernameFromId(String userId) {
        if (userId == null || userId.isEmpty()) {
            return "Unknown";
        }
        return userRepository.findById(userId)
                .map(Users::getUsername)
                .orElse("User not found in system");
    }

    @Override
    public String createRank(CreateRankRequest request) {

        if (rankRepository.existsByRankCode(request.getRankCode())) {
            throw new AppException(ErrorCode.RANK_CODE_EXISTED);
        }

//        if (rankRepository.existsByRankName(request.getRankName())) {
//            throw new AppException(ErrorCode.RANK_NAME_EXISTED);
//        }
//
//        if (rankRepository.existsByPriority(request.getPriority())) {
//            throw new AppException(ErrorCode.RANK_PRIORITY_EXISTED);
//        }

        Rank rank = rankMapper.toRank(request);

        rank.setCreatedAt(LocalDateTime.now());
        rank.setUpdatedAt(LocalDateTime.now());
        rank.setCreatedBy(getCurrentUserId());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        saveLog("Tạo rank: code=" + rank.getRankCode()
                + ", name=" + rank.getRankName()
                + ", priority=" + rank.getPriority());

        return "Create rank successfully";
    }

    @Override
    public String updateRank(Integer id, UpdateRankRequest request) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

//        if (!rank.getRankName().equals(request.getRankName())
//                && rankRepository.existsByRankName(request.getRankName())) {
//            throw new AppException(ErrorCode.RANK_NAME_EXISTED);
//        }

        if (!rank.getPriority().equals(request.getPriority())
                && rankRepository.existsByPriority(request.getPriority())) {
            throw new AppException(ErrorCode.RANK_PRIORITY_EXISTED);
        }

        rank.setRankName(request.getRankName());
        rank.setDescription(request.getDescription());
        rank.setIcon(request.getIcon());
        rank.setColor(request.getColor());
        rank.setPriority(request.getPriority());

        rank.setUpgradeMinTotalRevenue(request.getUpgradeMinTotalRevenue());
        rank.setMaintainMinRevenue(request.getMaintainMinRevenue());

        rank.setUpdatedAt(LocalDateTime.now());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        saveLog("Cập nhật thông tin của hạng: "+ rank.getRankCode() + " - " + rank.getRankName());

        return "Update rank successfully";
    }

    @Override
    public RankResponse getRankDetail(Integer id) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        RankResponse response = rankMapper.toResponse(rank);

        Long count = rankRepository.countAgencyByRankId(id);
        response.setAgencies(count);

        response.setUpdatedAt(rank.getUpdatedAt());
        response.setUpdatedBy(getUsernameFromId(rank.getUpdatedBy()));

        return response;
    }

    @Override
    public List<RankResponse> getAllRanks() {

        List<Rank> ranks = rankRepository.findAllOrderByPriority();

        return ranks.stream().map(rank -> {
            RankResponse res = rankMapper.toResponse(rank);
            res.setAgencies(rankRepository.countAgencyByRankId(rank.getId()));
            return res;
        }).toList();
    }

    @Override
    public String deleteRank(Integer id) {

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        Long count = rankRepository.countAgencyByRankId(id);

        if (count > 0) {
            throw new AppException(ErrorCode.RANK_IN_USE);
        }

        rank.setIsActive(false);
        rank.setUpdatedAt(LocalDateTime.now());
        rank.setUpdatedBy(getCurrentUserId());

        rankRepository.save(rank);

        saveLog("Dừng hoạt động hạng: " + rank.getRankCode() + " - " + rank.getRankName());

        return "Delete rank successfully";
    }

    private boolean isValidMonthDay(String value) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
            MonthDay.parse(value, formatter);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String updateRankPeriod(UpdateRankPeriodRequest request) {

        RankPeriodType periodType;
        try {
            periodType = RankPeriodType.valueOf(request.getType());
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CONFIG_TYPE);
        }

        // Validate format MM-dd
        if (!isValidMonthDay(request.getValue())) {
            throw new AppException(ErrorCode.INVALID_DATE_FORMAT);
        }

        // Lấy config theo config_code = type
        SystemConfig config = systemConfigRepository
                .findByConfigCode(periodType.name())
                .orElseThrow(() -> new AppException(ErrorCode.CONFIG_NOT_FOUND));

        // Update value + audit field
        config.setConfigValue(request.getValue());
        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(getCurrentUserId());

        systemConfigRepository.save(config);

        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "SYSTEM",
                    "Cập nhật chu kỳ xếp hạng",
                    "Chu kỳ xếp hạng " + periodType.name() + " đã được cập nhật thành " + request.getValue() + ".",
                    "CONFIG", periodType.name(), "/admin/system-config");
        }
        return "Update " + periodType.name() + " successfully";
    }

    @Override
    public String getRankPeriod(String type) {

        RankPeriodType periodType;
        try {
            periodType = RankPeriodType.valueOf(type);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CONFIG_TYPE);
        }

        SystemConfig config = systemConfigRepository
                .findByConfigCode(periodType.name())
                .orElseThrow(() -> new AppException(ErrorCode.CONFIG_NOT_FOUND));

        return config.getConfigValue();
    }

    @Override
    public RankPeriodResponse getAllRankPeriods() {

        List<String> types = List.of(
                RankPeriodType.RANK_PERIOD_1_START.name(),
                RankPeriodType.RANK_PERIOD_1_END.name(),
                RankPeriodType.RANK_PERIOD_2_START.name(),
                RankPeriodType.RANK_PERIOD_2_END.name()
        );

        List<SystemConfig> configs = systemConfigRepository.findByConfigCodeIn(types);

        List<RankPeriodItemResponse> items = rankPeriodMapper.toResponseList(configs);

        RankPeriodResponse response = new RankPeriodResponse();
        response.setPeriods(items);

        return response;
    }

    @Override
    public RankDateResponse getLatestPeriod() {

        Map<String, String> configMap = systemConfigRepository
                .findByConfigCodeIn(List.of(
                        RankPeriodType.RANK_PERIOD_1_START.name(),
                        RankPeriodType.RANK_PERIOD_1_END.name(),
                        RankPeriodType.RANK_PERIOD_2_START.name(),
                        RankPeriodType.RANK_PERIOD_2_END.name()
                ))
                .stream()
                .collect(Collectors.toMap(SystemConfig::getConfigCode, SystemConfig::getConfigValue));

        LocalDate now = LocalDate.now();
        int year = now.getYear();

        LocalDate period1Start = LocalDate.parse(year + "-" + configMap.get("RANK_PERIOD_1_START"));
        LocalDate period1End = LocalDate.parse(year + "-" + configMap.get("RANK_PERIOD_1_END"));

        LocalDate period2Start = LocalDate.parse(year + "-" + configMap.get("RANK_PERIOD_2_START"));
        LocalDate period2End = LocalDate.parse(year + "-" + configMap.get("RANK_PERIOD_2_END"));

        // nếu đang ở kỳ 2 → lấy kỳ 1
        if (!now.isBefore(period2Start)) {
            return RankDateResponse.builder()
                    .startDate(period1Start)
                    .endDate(period1End)
                    .build();
        }

        // nếu đang ở kỳ 1 → lấy kỳ 2 của năm trước
        return RankDateResponse.builder()
                .startDate(period2Start.minusYears(1))
                .endDate(period2End.minusYears(1))
                .build();
    }

    private Rank findTargetRank(BigDecimal revenue, List<Rank> ranks) {
        return ranks.stream()
                .filter(r -> revenue.compareTo(r.getUpgradeMinTotalRevenue()) >= 0)
                .findFirst()
                .orElse(ranks.get(ranks.size() - 1)); // rank thấp nhất
    }

    private Rank resolveCurrentRank(Agency agency, List<Rank> ranks, BigDecimal revenue) {
        Rank current = agency.getRank();

        if (current.getIsActive()) return current;

        // rank bị disable → tìm lại theo revenue
        return findTargetRank(revenue, ranks);
    }

    private Map<Long, BigDecimal> mapRevenue(List<Object[]> raw) {
        Map<Long, BigDecimal> map = new HashMap<>();
        for (Object[] row : raw) {
            map.put(
                    ((Number) row[0]).longValue(),
                    (BigDecimal) row[1]
            );
        }
        return map;
    }

    @Override
    public List<AgencyRankChangeResponse> getUpgradeCandidates(RankEvaluateRequest request) {

        List<Agency> agencies = agencyRepository.findAllActive();
        List<Rank> ranks = rankRepository.findAllActiveOrderByPriorityDesc();

        LocalDateTime endDateTime = request.getEndDate().atTime(23, 59, 59);

        Set<Long> excludedAgencyIds = new HashSet<>(
                rankHistoryRepository.findAgencyIdsChangedAfter(endDateTime)
        );

        Map<Long, BigDecimal> revenueMap = mapRevenue(
                revenueRepository.getTotalRevenueByAgency(
                        request.getStartDate(),
                        request.getEndDate()
                )
        );

        List<AgencyRankChangeResponse> result = new ArrayList<>();

        for (Agency agency : agencies) {
            if (excludedAgencyIds.contains(agency.getAgencyId())) continue;

            BigDecimal revenue = revenueMap.getOrDefault(agency.getAgencyId(), BigDecimal.ZERO);

            Rank currentRank = resolveCurrentRank(agency, ranks, revenue);
            Rank targetRank = findTargetRank(revenue, ranks);

            if (targetRank.getPriority() > currentRank.getPriority()) {
                result.add(AgencyRankChangeResponse.builder()
                        .agencyId(agency.getAgencyId())
                        .agencyName(agency.getAgencyName())
                        .email(agency.getEmail())
                        .currentRank(currentRank.getRankName())
                        .targetRank(targetRank.getRankName())
                        .targetRankId(targetRank.getId())
                        .build());
            }
        }

        return result;
    }

    @Override
    public List<AgencyRankChangeResponse> getDowngradeCandidates(RankEvaluateRequest request) {

        List<Agency> agencies = agencyRepository.findAllActive();
        List<Rank> ranks = rankRepository.findAllActiveOrderByPriorityDesc();

        LocalDateTime endDateTime = request.getEndDate().atTime(23, 59, 59);

        Set<Long> excludedAgencyIds = new HashSet<>(
                rankHistoryRepository.findAgencyIdsChangedAfter(endDateTime)
        );

        Map<Long, BigDecimal> revenueMap = mapRevenue(
                revenueRepository.getTotalRevenueByAgency(
                        request.getStartDate(),
                        request.getEndDate()
                )
        );

        List<AgencyRankChangeResponse> result = new ArrayList<>();

        for (Agency agency : agencies) {
            if (excludedAgencyIds.contains(agency.getAgencyId())) continue;

            BigDecimal revenue = revenueMap.getOrDefault(agency.getAgencyId(), BigDecimal.ZERO);

            Rank currentRank = resolveCurrentRank(agency, ranks, revenue);

            // check giữ hạng
            if (revenue.compareTo(currentRank.getMaintainMinRevenue()) >= 0) continue;

            // hạ xuống 1 bậc
            Rank lowerRank = ranks.stream()
                    .filter(r -> r.getPriority() < currentRank.getPriority())
                    .findFirst()
                    .orElse(null);

            if (lowerRank != null) {
                result.add(AgencyRankChangeResponse.builder()
                        .agencyId(agency.getAgencyId())
                        .agencyName(agency.getAgencyName())
                        .email(agency.getEmail())
                        .currentRank(currentRank.getRankName())
                        .targetRank(lowerRank.getRankName())
                        .targetRankId(lowerRank.getId())
                        .build());
            }
        }

        return result;
    }

    @Override
    @Transactional
    public AgencyRankDetailResponse getAgencyRankDetail(AgencyRankDetailRequest request) {

        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        Rank targetRank = rankRepository.findById(request.getTargetRankId())
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        // partner verification latest
        PartnerVerification pv = partnerVerificationRepository
                .findLatestByAgencyId(agency.getAgencyId())
                .stream().findFirst().orElse(null);

        // booking ids
        List<Long> bookingIds = revenueRepository.findBookingIds(
                agency.getAgencyId(),
                request.getStartDate(),
                request.getEndDate()
        );

        // total revenue
        BigDecimal totalRevenue = revenueRepository
                .getTotalRevenueByAgency(request.getStartDate(), request.getEndDate())
                .stream()
                .filter(r -> ((Number) r[0]).longValue() == agency.getAgencyId())
                .map(r -> (BigDecimal) r[1])
                .findFirst()
                .orElse(BigDecimal.ZERO);

        // history
        List<RankHistoryItem> histories = rankHistoryRepository
                .findByAgencyId(agency.getAgencyId())
                .stream()
                .map(h -> RankHistoryItem.builder()
                        .id(h.getId())
                        .oldRank(h.getOldRank() != null ? h.getOldRank().getRankName() : null)
                        .newRank(h.getNewRank().getRankName())
                        .totalRevenue(h.getTotalRevenueSnapshot())
                        .changeType(h.getChangeType())
                        .reason(h.getReason())
                        .changedAt(h.getChangedAt())
                        .build()
                ).toList();

        return AgencyRankDetailResponse.builder()
                .agencyId(agency.getAgencyId())
                .agencyName(agency.getAgencyName())
                .address(agency.getAddress())
                .createdAt(agency.getCreatedAt())
                .partnerVerificationId(pv != null ? pv.getId() : null)
                .bookingIds(bookingIds)
                .totalRevenue(totalRevenue)
                .currentRank(rankMapper.toResponse(agency.getRank()))
                .targetRank(rankMapper.toResponse(targetRank))
                .histories(histories)
                .changeType(request.getChangeType())
                .build();
    }

    @Override
    @Transactional
    public String changeRank(ChangeRankRequest request) {

        Agency agency = agencyRepository.findById(request.getAgencyId())
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        Rank currentRank = rankRepository.findById(request.getCurrentRankId())
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        Rank targetRank = rankRepository.findById(request.getTargetRankId())
                .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

        RankHistory history = new RankHistory();
        history.setAgency(agency);
        history.setOldRank(currentRank);
        history.setNewRank(targetRank);
        history.setTotalRevenueSnapshot(request.getTotalRevenue());
        history.setReason(request.getReason());
        history.setChangedAt(LocalDateTime.now());
        history.setChangedBy(getCurrentUserId());

        if ("APPROVE".equalsIgnoreCase(request.getStatus())) {

            history.setChangeType(request.getChangeType());

            agency.setRank(targetRank);
            agency.setCreditLimit(targetRank.getCreditLimit());
            agency.setCurrentCredit(targetRank.getCreditLimit());

            agencyRepository.save(agency);

        } else {
            history.setChangeType("HOLD");
            agency.setRank(currentRank);
            agency.setCreditLimit(currentRank.getCreditLimit());
            agency.setCurrentCredit(currentRank.getCreditLimit());

            agencyRepository.save(agency);
        }

        rankHistoryRepository.save(history);

        saveLog("Cập nhật xếp hạng cho agency: "
                + agency.getAgencyName()
                + " từ " + currentRank.getRankCode()
                + " -> " + targetRank.getRankCode());

        List<Users> agencyUsers = userRepository.findByAgency_AgencyId(request.getAgencyId());

        String action = "APPROVE".equalsIgnoreCase(request.getStatus()) ? "được cập nhật" : "được giữ nguyên";
        for (Users u : agencyUsers) {
            notificationService.sendNotification(u.getId(), "RANK",
                    "Cập nhật hạng đại lý",
                    "Hạng của đại lý bạn " + action + " thành " + targetRank.getRankCode() + ".",
                    "RANK", String.valueOf(request.getAgencyId()), null);
        }
        return "Change rank successfully";
    }


    @Override
    public List<RankHistoryResponse> getAllRankHistories() {

        List<RankHistory> histories = rankHistoryRepository.findAll();

        return histories.stream().map(h -> RankHistoryResponse.builder()
                .id(h.getId())
                .agencyId(h.getAgency().getAgencyId())
                .agencyName(h.getAgency().getAgencyName())
                .oldRank(h.getOldRank() != null ? h.getOldRank().getRankName() : null)
                .newRank(h.getNewRank().getRankName())
                .totalRevenue(h.getTotalRevenueSnapshot())
                .changeType(h.getChangeType())
                .reason(h.getReason())
                .changedAt(h.getChangedAt())
                .changedBy(getUsernameFromId(h.getChangedBy())) // convert id -> username
                .build()
        ).toList();
    }
    @Override
    public List<RankHistoryResponse> getMyAgencyRankHistories() {

        String userId = getCurrentUserId();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAgency() == null) {
            throw new RuntimeException("User is not belong to any agency");
        }

        Long agencyId = user.getAgency().getAgencyId();

        List<RankHistory> histories = rankHistoryRepository.findByAgency_AgencyId(agencyId);

        return histories.stream().map(h -> RankHistoryResponse.builder()
                .id(h.getId())
                .agencyId(h.getAgency().getAgencyId())
                .agencyName(h.getAgency().getAgencyName())
                .oldRank(h.getOldRank() != null ? h.getOldRank().getRankName() : null)
                .newRank(h.getNewRank().getRankName())
                .totalRevenue(h.getTotalRevenueSnapshot())
                .changeType(h.getChangeType())
                .reason(h.getReason())
                .changedAt(h.getChangedAt())
                .changedBy(getUsernameFromId(h.getChangedBy()))
                .build()
        ).toList();
    }
}