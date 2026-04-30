package com.HTPj.htpj.repository;
import com.HTPj.htpj.entity.AgencyBookingRevenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AgencyBookingRevenueRepository extends JpaRepository<AgencyBookingRevenue, Long> {

    @Query(value = """
        SELECT abr.agency_id as agencyId, SUM(abr.revenue_amount) as totalRevenue
        FROM agency_booking_revenue abr
        WHERE abr.checkout_date BETWEEN :startDate AND :endDate
        GROUP BY abr.agency_id
    """, nativeQuery = true)
    List<Object[]> getTotalRevenueByAgency(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    SELECT booking_id
    FROM agency_booking_revenue
    WHERE agency_id = :agencyId
    AND checkout_date BETWEEN :startDate AND :endDate
""", nativeQuery = true)
    List<Long> findBookingIds(
            @Param("agencyId") Long agencyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}