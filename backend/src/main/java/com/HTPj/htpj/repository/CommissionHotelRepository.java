package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.CommissionHotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionHotelRepository extends JpaRepository<CommissionHotel, Long> {

    List<CommissionHotel> findByCommissionId(Long commissionId);
    void deleteByHotelId(Integer hotelId);
}