package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PayoutLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayoutLineItemRepository extends JpaRepository<PayoutLineItem, Long> {

    @Query("""
        SELECT pli FROM PayoutLineItem pli
        WHERE pli.payoutStatement.statementId = :statementId
        ORDER BY pli.checkInDate
    """)
    List<PayoutLineItem> findByStatementId(@Param("statementId") Long statementId);
}
