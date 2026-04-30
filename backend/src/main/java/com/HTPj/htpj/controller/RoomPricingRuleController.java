package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
import com.HTPj.htpj.service.RoomPricingRuleService;
import com.HTPj.htpj.service.impl.RoomPricingRuleServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/room-pricing-rules")
@RequiredArgsConstructor
public class RoomPricingRuleController {

    private final RoomPricingRuleService service;

    @PostMapping
    public RoomPricingRuleResponse create(
            @RequestBody RoomPricingRuleRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public RoomPricingRuleResponse update(
            @PathVariable Integer id,
            @RequestBody RoomPricingRuleRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public RoomPricingRuleResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @GetMapping("/room-type/{roomTypeId}")
    public List<RoomPricingRuleResponse> getByRoomType(
            @PathVariable Integer roomTypeId
    ) {
        return service.getByRoomType(roomTypeId);
    }

    /* ================= PRICING ENGINE ================= */

    @GetMapping("/calculate")
    public BigDecimal calculatePrice(
            @RequestParam Integer roomTypeId,
            @RequestParam String date,
            @RequestParam BigDecimal basePrice
    ) {
        return service.calculateFinalPrice(
                roomTypeId,
                LocalDate.parse(date),
                basePrice
        );
    }
}