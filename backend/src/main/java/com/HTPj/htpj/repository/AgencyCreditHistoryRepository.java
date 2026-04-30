package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.AgencyCreditHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyCreditHistoryRepository extends JpaRepository<AgencyCreditHistory, Long> {
}
