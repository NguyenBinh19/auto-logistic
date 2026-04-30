package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomAllotment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAllotmentRepository extends JpaRepository<RoomAllotment, Long> {

    Optional<RoomAllotment> findByRoomTypeIdAndAllotmentDate(Integer roomTypeId, LocalDate allotmentDate);

    List<RoomAllotment> findByRoomTypeIdAndAllotmentDateBetween(
            Integer roomTypeId, LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT ra FROM RoomAllotment ra
        WHERE ra.roomTypeId IN :roomTypeIds
          AND ra.allotmentDate BETWEEN :startDate AND :endDate
        ORDER BY ra.roomTypeId, ra.allotmentDate
    """)
    List<RoomAllotment> findByRoomTypeIdsAndDateRange(
            @Param("roomTypeIds") List<Integer> roomTypeIds,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT ra FROM RoomAllotment ra
        WHERE ra.roomTypeId = :roomTypeId
          AND ra.allotmentDate BETWEEN :startDate AND :endDate
          AND ra.stopSell = true
    """)
    List<RoomAllotment> findStopSellByRoomTypeAndDateRange(
            @Param("roomTypeId") Integer roomTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
