package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RoomPricingRuleService {

    RoomPricingRuleResponse create(RoomPricingRuleRequest request);

    RoomPricingRuleResponse update(Integer ruleId, RoomPricingRuleRequest request);

    void delete(Integer ruleId);

    RoomPricingRuleResponse getById(Integer ruleId);

    List<RoomPricingRuleResponse> getByRoomType(Integer roomTypeId);

    BigDecimal calculateFinalPrice(Integer roomTypeId, LocalDate date, BigDecimal basePrice);
}
