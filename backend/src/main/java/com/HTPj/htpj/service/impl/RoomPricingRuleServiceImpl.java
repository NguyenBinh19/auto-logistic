package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
import com.HTPj.htpj.entity.RoomPricingRule;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RoomPricingRuleMapper;
import com.HTPj.htpj.repository.RoomPricingRuleRepository;
import com.HTPj.htpj.service.RoomPricingRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RoomPricingRuleServiceImpl implements RoomPricingRuleService {

    private final RoomPricingRuleRepository repository;

    public RoomPricingRuleResponse create(RoomPricingRuleRequest request) {

        validate(request);

        if ("EVENT".equals(request.getRuleType())) {
            checkEventConflict(request);
        }

        RoomPricingRule rule = RoomPricingRuleMapper.toEntity(request);
        return RoomPricingRuleMapper.toResponse(repository.save(rule));
    }

    public RoomPricingRuleResponse update(Integer ruleId, RoomPricingRuleRequest request) {

        RoomPricingRule rule = repository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Room pricing rule not found"));

        validate(request);

        if ("EVENT".equals(request.getRuleType())) {
            checkEventConflictForUpdate(ruleId, request);
        }

        RoomPricingRuleMapper.update(rule, request);
        return RoomPricingRuleMapper.toResponse(repository.save(rule));
    }

    public void delete(Integer ruleId) {
        repository.deleteById(ruleId);
    }

    public RoomPricingRuleResponse getById(Integer ruleId) {
        return repository.findById(ruleId)
                .map(RoomPricingRuleMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Room pricing rule not found"));
    }

    public List<RoomPricingRuleResponse> getByRoomType(Integer roomTypeId) {
        return repository.findByRoomTypeId(roomTypeId)
                .stream()
                .map(RoomPricingRuleMapper::toResponse)
                .toList();
    }

    public BigDecimal calculateFinalPrice(
            Integer roomTypeId,
            LocalDate date,
            BigDecimal basePrice
    ) {

        List<RoomPricingRule> rules =
                repository.findByRoomTypeId(roomTypeId);

        String dayName = date.getDayOfWeek()
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<RoomPricingRule> matchedRules = rules.stream()
                .filter(RoomPricingRule::getIsActive)
                .filter(r -> isMatched(r, date, dayName))
                .sorted(Comparator.comparing(RoomPricingRule::getPriority,
                        Comparator.nullsFirst(Integer::compareTo)).reversed())
                .toList();

        BigDecimal finalPrice = basePrice;

        for (RoomPricingRule rule : matchedRules) {
            finalPrice = applyRule(finalPrice, rule);
        }

        return finalPrice.max(BigDecimal.ZERO);
    }

    private boolean isMatched(RoomPricingRule rule,
                              LocalDate date,
                              String dayName) {

        if ("WEEKLY".equals(rule.getRuleType())) {
            return rule.getDayOfWeek() != null
                    && rule.getDayOfWeek().equals(dayName);
        }

        if ("EVENT".equals(rule.getRuleType())) {
            return rule.getStartDate() != null
                    && rule.getEndDate() != null
                    && !date.isBefore(rule.getStartDate())
                    && !date.isAfter(rule.getEndDate());
        }

        return false;
    }

    private BigDecimal applyRule(BigDecimal price, RoomPricingRule rule) {

        if ("KEEP".equals(rule.getAction())) {
            return price;
        }

        BigDecimal value = rule.getAdjustmentValue();

        if ("PERCENT".equals(rule.getAdjustmentType())) {

            BigDecimal percentAmount = price
                    .multiply(value)
                    .divide(BigDecimal.valueOf(100));

            return "INCREASE".equals(rule.getAction())
                    ? price.add(percentAmount)
                    : price.subtract(percentAmount);
        }

        return "INCREASE".equals(rule.getAction())
                ? price.add(value)
                : price.subtract(value);
    }

    private void validate(RoomPricingRuleRequest request) {

        if ("WEEKLY".equals(request.getRuleType())
                && request.getDayOfWeek() == null) {
            throw new RuntimeException("Day of week is required for WEEKLY rule");
        }

        if ("EVENT".equals(request.getRuleType())
                && (request.getStartDate() == null
                || request.getEndDate() == null)) {
            throw new RuntimeException("Start date and End date are required for EVENT rule");
        }
    }

    private void checkEventConflict(RoomPricingRuleRequest request) {

        List<RoomPricingRule> conflicts =
                repository.findOverlappingEvent(
                        request.getRoomTypeId(),
                        request.getStartDate(),
                        request.getEndDate()
                );

        if (!conflicts.isEmpty()) {
            throw new AppException(ErrorCode.EVENT_DATE_CONFLICT);
        }
    }

    private void checkEventConflictForUpdate(
            Integer ruleId,
            RoomPricingRuleRequest request
    ) {

        List<RoomPricingRule> conflicts =
                repository.findOverlappingEventForUpdate(
                        request.getRoomTypeId(),
                        ruleId,
                        request.getStartDate(),
                        request.getEndDate()
                );

        if (!conflicts.isEmpty()) {
            throw new AppException(ErrorCode.EVENT_DATE_CONFLICT);
        }
    }
}