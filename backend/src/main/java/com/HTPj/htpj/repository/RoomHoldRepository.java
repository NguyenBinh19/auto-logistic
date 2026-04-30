package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomHold;
import com.HTPj.htpj.entity.RoomHoldDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomHoldRepository extends JpaRepository<RoomHold, Long> {

    Optional<RoomHold> findByHoldCode(String holdCode);

    @Query("""
    SELECT d
    FROM RoomHoldDetail d
    JOIN d.roomHold rh
    WHERE rh.hotelId = :hotelId
      AND UPPER(rh.status) = 'HOLDING'
      AND rh.checkInDate < :checkOut
      AND rh.checkOutDate > :checkIn
    """)
    List<RoomHoldDetail> findActiveOverlappingHoldDetails(
            @Param("hotelId") Integer hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
    SELECT d
    FROM RoomHoldDetail d
    JOIN d.roomHold rh
    WHERE rh.hotelId IN :hotelIds
      AND UPPER(rh.status) = 'HOLDING'
      AND rh.checkInDate < :checkOut
      AND rh.checkOutDate > :checkIn
    """)
    List<RoomHoldDetail> findActiveOverlappingHoldDetailsForHotels(
            @Param("hotelIds") List<Integer> hotelIds,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
