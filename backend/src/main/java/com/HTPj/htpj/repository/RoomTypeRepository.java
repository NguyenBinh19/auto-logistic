package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByRoomCode(String roomCode);
    List<RoomType> findByHotel_HotelId(Integer hotelId);
    List<RoomType> findByHotel_HotelIdIn(List<Integer> hotelIds);
    boolean existsByHotel_HotelIdAndRoomCode(Integer hotelId, String roomCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT rt FROM RoomType rt
    WHERE rt.roomTypeId IN :ids
    """)
    List<RoomType> findByIdsForUpdate(@Param("ids") List<Integer> ids);
}
