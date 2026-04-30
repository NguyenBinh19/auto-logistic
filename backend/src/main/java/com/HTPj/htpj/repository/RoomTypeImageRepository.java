package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RoomTypeImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeImageRepository extends JpaRepository<RoomTypeImage, Integer> {
    List<RoomTypeImage> findByRoomType_RoomTypeId(Integer roomTypeId);
}