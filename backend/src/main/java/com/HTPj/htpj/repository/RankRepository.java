package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Rank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankRepository extends JpaRepository<Rank, Integer> {

    boolean existsByRankName(String rankName);

    boolean existsByPriority(Integer priority);

    @Query("""
        SELECT COUNT(a) FROM Agency a
        WHERE a.rank.id = :rankId
    """)
    Long countAgencyByRankId(@Param("rankId") Integer rankId);

    @Query("""
        SELECT r FROM Rank r
        ORDER BY r.priority ASC
    """)
    List<Rank> findAllOrderByPriority();

    boolean existsByRankCode(String rankCode);

    Optional<Rank> findByRankCode(String rankCode);

    @Query("""
    SELECT r FROM Rank r
    WHERE r.isActive = true
    ORDER BY r.priority DESC
""")
    List<Rank> findAllActiveOrderByPriorityDesc();

}
