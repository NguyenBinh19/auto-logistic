package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.CommissionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionLogRepository extends JpaRepository<CommissionLog, Long> {
    List<CommissionLog> findByHotelId(Long hotelId);

}