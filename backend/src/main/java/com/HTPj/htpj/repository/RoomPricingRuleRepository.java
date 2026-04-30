package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomPricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RoomPricingRuleRepository
        extends JpaRepository<RoomPricingRule, Integer> {

    /* ================= BASIC ================= */

    List<RoomPricingRule> findByRoomTypeId(Integer roomTypeId);

    List<RoomPricingRule> findByRoomTypeIdAndIsActiveTrueOrderByPriorityDesc(
            Integer roomTypeId
    );

    List<RoomPricingRule> findByRoomTypeIdAndRuleTypeAndIsActiveTrue(
            Integer roomTypeId,
            String ruleType
    );
    List<RoomPricingRule> findByRoomTypeIdAndIsActiveTrue(Integer roomTypeId);


    /* ================= EVENT CONFLICT ================= */

    @Query("""
        SELECT r FROM RoomPricingRule r
        WHERE r.roomTypeId = :roomTypeId
        AND r.ruleType = 'EVENT'
        AND r.isActive = true
        AND r.startDate <= :endDate
        AND r.endDate >= :startDate
    """)
    List<RoomPricingRule> findOverlappingEvent(
            Integer roomTypeId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
        SELECT r FROM RoomPricingRule r
        WHERE r.roomTypeId = :roomTypeId
        AND r.ruleType = 'EVENT'
        AND r.isActive = true
        AND r.ruleId <> :ruleId
        AND r.startDate <= :endDate
        AND r.endDate >= :startDate
    """)
    List<RoomPricingRule> findOverlappingEventForUpdate(
            Integer roomTypeId,
            Integer ruleId,
            LocalDate startDate,
            LocalDate endDate
    );
}