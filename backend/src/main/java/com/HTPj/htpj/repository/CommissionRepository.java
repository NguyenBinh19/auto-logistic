package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {

    @Query("SELECT c FROM Commission c WHERE c.commissionType = 'DEFAULT'")
    Optional<Commission> findDefault();

    @Query("""
    SELECT c FROM Commission c
    WHERE c.commissionType = 'DEAL'
    AND c.isActive = true
    AND c.startDate <= :now
    AND c.endDate >= :now
""")
    List<Commission> findValidDeal(@Param("now") LocalDateTime now);
}