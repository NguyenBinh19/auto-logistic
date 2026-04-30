package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AgencyRepository extends JpaRepository<Agency,Long> {
    boolean existsByEmail(String email);
    @Query(value = """
        SELECT *
        FROM agencies
        WHERE agency_id = :agencyId
    """, nativeQuery = true)
    Agency findAgenciesFinanceInfo(@Param("agencyId") Long agencyId);

    @Query("""
    SELECT a FROM Agency a
    WHERE a.status = 'ACTIVE'
    """)
    List<Agency> findAllActive();

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM TransactionHistory t " +
            "WHERE t.agency.id = :agencyId AND t.transactionType = 'Payment' " +
            "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
    BigDecimal getTotalSpending(@Param("agencyId") Long agencyId,
                                @Param("year") int year,
                                @Param("month") int month);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM TransactionHistory t " +
            "WHERE t.agency.id = :agencyId AND t.transactionType = 'Top-up' " +
            "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
    BigDecimal getTotalTopup(@Param("agencyId") Long agencyId,
                             @Param("year") int year,
                             @Param("month") int month);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM TransactionHistory t " +
            "WHERE t.agency.id = :agencyId AND t.transactionType = 'Penalty' " +
            "AND YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month")
    BigDecimal getTotalPenalty(@Param("agencyId") Long agencyId,
                               @Param("year") int year,
                               @Param("month") int month);

}
