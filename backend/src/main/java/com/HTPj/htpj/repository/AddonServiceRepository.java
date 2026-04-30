package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.AddonService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddonServiceRepository extends JpaRepository<AddonService, Long> {

    List<AddonService> findByHotel_HotelId(Integer hotelId);

    List<AddonService> findByHotel_HotelIdAndCategory(Integer hotelId, String category);

    List<AddonService> findByHotel_HotelIdAndStatus(Integer hotelId, String status);
}
