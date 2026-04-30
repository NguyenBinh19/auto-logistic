package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    boolean existsByRoomCode(String roomCode);
    List<RoomType> findByHotel_HotelId(Integer hotelId);
    List<RoomType> findByHotel_HotelIdIn(List<Integer> hotelIds);
}
