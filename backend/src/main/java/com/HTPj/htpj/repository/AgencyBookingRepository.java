package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.AgencyBooking;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

public interface AgencyBookingRepository extends JpaRepository<AgencyBooking, Long> {
    Optional<AgencyBooking> findByAgencyIdAndMonth(Long agencyId, String month);

    List<AgencyBooking> findByAgencyIdAndIsPaidFalse(Long agencyId);

    @Modifying
    @Transactional
    @Query(
            value = """
            UPDATE agencies
            SET status = 'ACTIVE'
            WHERE agency_id IN (
                SELECT ab.agency_id
                FROM agency_booking ab
                WHERE ab.is_paid = 1
            );
""", nativeQuery = true
    )
    void updateStatusForPaidAgency();
}
