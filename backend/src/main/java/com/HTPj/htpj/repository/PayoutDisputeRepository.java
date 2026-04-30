package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PayoutDispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayoutDisputeRepository extends JpaRepository<PayoutDispute, Long> {

    Optional<PayoutDispute> findByStatement_StatementId(Long statementId);

}
