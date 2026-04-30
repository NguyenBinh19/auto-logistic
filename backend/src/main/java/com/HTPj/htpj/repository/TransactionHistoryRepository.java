package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto;
import com.HTPj.htpj.entity.TransactionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {
    @Query("""
                SELECT new com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto(
                    th.id,
                    th.transactionCode,
                    th.transactionDate,
                    th.transactionType,
                    th.description,
                    th.sourceType,
                    th.amount,
                    th.balanceAfter,
                    th.status,
                    th.direction
                )
                FROM TransactionHistory th
                WHERE th.agency.agencyId = :agencyId
                ORDER BY th.transactionDate DESC
            """)
    List<TransactionHistoryDto> findRecentByAgencyId(@Param("agencyId") Long agencyId,
                                                     org.springframework.data.domain.Pageable pageable);

    @Query("""
                SELECT new com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto(
                    th.id,
                    th.transactionCode,
                    th.transactionDate,
                    th.transactionType,
                    th.description,
                    th.sourceType,
                    th.amount,
                    th.balanceAfter,
                    th.status,
                    th.direction
                )
                FROM TransactionHistory th
                WHERE th.agency.agencyId = :agencyId
            """)
    Page<TransactionHistoryDto> findByAgencyIdPaged(@Param("agencyId") Long agencyId, Pageable pageable);

    @Query("""
                SELECT new com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto(
                    th.id, th.transactionCode, th.transactionDate,
                    th.transactionType, th.description, th.sourceType,
                    th.amount, th.balanceAfter, th.status, th.direction
                )
                FROM TransactionHistory th
                WHERE th.agency.agencyId = :agencyId
                  AND (:from IS NULL OR th.transactionDate >= :from)
                  AND (:to IS NULL OR th.transactionDate <= :to)
                  AND (:type = 'ALL' OR th.transactionType = :type)
                  AND (:source = 'ALL' OR th.sourceType = :source)
            """)
    Page<TransactionHistoryDto> findByFilters(
            @Param("agencyId") Long agencyId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("type") String type,
            @Param("source") String source,
            Pageable pageable);

    @Query("""
                SELECT new com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto(
                    th.id, th.transactionCode, th.transactionDate,
                    th.transactionType, th.description, th.sourceType,
                    th.amount, th.balanceAfter, th.status, th.direction
                )
                FROM TransactionHistory th
                WHERE th.agency.agencyId = :agencyId
                  AND (:from IS NULL OR th.transactionDate >= :from)
                  AND (:to IS NULL OR th.transactionDate <= :to)
                  AND (:type = 'ALL' OR th.transactionType = :type)
                  AND (:source = 'ALL' OR th.sourceType = :source)
            """)
    List<TransactionHistoryDto> findByFiltersWOPageable(
            @Param("agencyId") Long agencyId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("type") String type,
            @Param("source") String source);

    @Query("SELECT new com.HTPj.htpj.dto.DataSourceResponse.transaction.TransactionHistoryDto(" +
            "th.id, th.transactionCode, th.transactionDate, th.transactionType, th.description, " +
            "th.sourceType, th.amount, th.balanceAfter, th.status, th.direction) " +
            "FROM TransactionHistory th WHERE th.agency.id = :agencyId")
    List<TransactionHistoryDto> findByAgencyId(@Param("agencyId") Long agencyId);

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
