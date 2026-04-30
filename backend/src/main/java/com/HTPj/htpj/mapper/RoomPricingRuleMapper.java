package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
import com.HTPj.htpj.entity.RoomPricingRule;

public class RoomPricingRuleMapper {

    /* ================= TO ENTITY ================= */

    public static RoomPricingRule toEntity(RoomPricingRuleRequest req) {
        return RoomPricingRule.builder()
                .roomTypeId(req.getRoomTypeId())
                .ruleName(req.getRuleName())
                .ruleType(req.getRuleType())
                .dayOfWeek(req.getDayOfWeek())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .action(req.getAction())
                .adjustmentType(req.getAdjustmentType())
                .adjustmentValue(req.getAdjustmentValue())
                .priority(req.getPriority())
                .isActive(req.getIsActive())
                .build();
    }

    /* ================= TO RESPONSE ================= */

    public static RoomPricingRuleResponse toResponse(RoomPricingRule e) {
        return RoomPricingRuleResponse.builder()
                .ruleId(e.getRuleId())
                .roomTypeId(e.getRoomTypeId())
                .ruleName(e.getRuleName())
                .ruleType(e.getRuleType())
                .dayOfWeek(e.getDayOfWeek())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .action(e.getAction())
                .adjustmentType(e.getAdjustmentType())
                .adjustmentValue(e.getAdjustmentValue())
                .priority(e.getPriority())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    /* ================= UPDATE ================= */

    public static void update(RoomPricingRule e, RoomPricingRuleRequest req) {
        e.setRuleName(req.getRuleName());
        e.setRuleType(req.getRuleType());
        e.setDayOfWeek(req.getDayOfWeek());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setAction(req.getAction());
        e.setAdjustmentType(req.getAdjustmentType());
        e.setAdjustmentValue(req.getAdjustmentValue());
        e.setPriority(req.getPriority());
        e.setIsActive(req.getIsActive());
    }
}