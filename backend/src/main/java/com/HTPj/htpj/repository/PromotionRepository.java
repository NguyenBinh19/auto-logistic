package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    boolean existsByCode(String code);
    Optional<Promotion> findByIdAndIsDeletedFalse(Integer id);
    boolean existsByCodeAndIsDeletedFalse(String code);
    List<Promotion> findByHotelIdAndIsDeletedFalse(Integer hotelId);
    Optional<Promotion> findByCodeAndIsDeletedFalse(String code);

    @Modifying
    @Query("""
    UPDATE Promotion p
    SET p.usedCount = p.usedCount + 1
    WHERE p.id = :id
    """)
    void increaseUsedCount(@Param("id") Integer id);
}