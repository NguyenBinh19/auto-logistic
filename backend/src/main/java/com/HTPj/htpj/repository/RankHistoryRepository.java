package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.RankHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RankHistoryRepository extends JpaRepository<RankHistory, Long> {

    @Query("""
        SELECT rh FROM RankHistory rh
        WHERE rh.agency.agencyId = :agencyId
        ORDER BY rh.changedAt DESC
    """)
    List<RankHistory> findByAgencyId(@Param("agencyId") Long agencyId);

    @Query("""
    SELECT DISTINCT rh.agency.agencyId
    FROM RankHistory rh
    WHERE rh.changedAt > :endDate
""")
    List<Long> findAgencyIdsChangedAfter(@Param("endDate") LocalDateTime endDate);

    List<RankHistory> findByAgency_AgencyId(Long agencyId);
}
