package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PayoutStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayoutStatementRepository extends JpaRepository<PayoutStatement, Long> {

    Optional<PayoutStatement> findByStatementCode(String statementCode);

    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.hotelId = :hotelId
        ORDER BY ps.periodEnd DESC
    """)
    List<PayoutStatement> findByHotelId(@Param("hotelId") Integer hotelId);

    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.hotelId = :hotelId
          AND ps.status = :status
        ORDER BY ps.periodEnd DESC
    """)
    List<PayoutStatement> findByHotelIdAndStatus(
            @Param("hotelId") Integer hotelId,
            @Param("status") String status);

    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.status = :status
        ORDER BY ps.periodEnd DESC
    """)
    List<PayoutStatement> findByStatus(@Param("status") String status);

    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.periodStart >= :startDate
          AND ps.periodEnd <= :endDate
        ORDER BY ps.periodEnd DESC
    """)
    List<PayoutStatement> findByPeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.status IN :statuses
        ORDER BY ps.hotelId, ps.periodEnd DESC
    """)
    List<PayoutStatement> findByStatuses(@Param("statuses") List<String> statuses);

    boolean existsByHotelIdAndPeriodStartAndPeriodEnd(
            Integer hotelId, LocalDate periodStart, LocalDate periodEnd);

    /**
     * Returns distinct hotelIds that have at least one ROLLOVER statement.
     * Used when generating the next cycle: hotels with rolled-over balance must
     * receive a new statement even if they have no new unprocessed bookings.
     */
    @Query("SELECT DISTINCT ps.hotelId FROM PayoutStatement ps WHERE ps.status = 'ROLLOVER'")
    List<Integer> findHotelIdsWithRolloverStatements();

    /**
     * Returns all ROLLOVER statements for a given hotel, ordered oldest first so
     * they are absorbed in chronological order.
     */
    @Query("""
        SELECT ps FROM PayoutStatement ps
        WHERE ps.hotelId = :hotelId
          AND ps.status = 'ROLLOVER'
        ORDER BY ps.periodEnd ASC
    """)
    List<PayoutStatement> findRolloverStatementsByHotelId(@Param("hotelId") Integer hotelId);

}
