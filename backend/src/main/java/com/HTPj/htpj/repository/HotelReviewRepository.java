package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.HotelReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HotelReviewRepository
        extends JpaRepository<HotelReview, Integer> {

    @Query("""
        SELECT CAST(ROUND(AVG(CAST(r.ratingScore AS double)), 1) AS double)
        FROM HotelReview r
        WHERE r.hotel.hotelId = :hotelId
    """)
    Double getAvgRating(Integer hotelId);

    @Query("""
    SELECT COUNT(r) 
    FROM HotelReview r 
    WHERE r.hotel.hotelId = :hotelId
""")
    Integer countByHotelId(Integer hotelId);

    boolean existsByBookingId(Long bookingId);

    // UC-033: Agency feedback history
    Page<HotelReview> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    // UC-055: Hotel's received feedback
    @Query("SELECT r FROM HotelReview r WHERE r.hotel.hotelId = :hotelId ORDER BY r.createdAt DESC")
    Page<HotelReview> findByHotelId(@Param("hotelId") Integer hotelId, Pageable pageable);

    // Stats for hotel dashboard
    @Query("""
        SELECT CAST(ROUND(AVG(CAST(r.cleanlinessScore AS double)), 1) AS double)
        FROM HotelReview r WHERE r.hotel.hotelId = :hotelId
    """)
    Double getAvgCleanliness(@Param("hotelId") Integer hotelId);

    @Query("""
        SELECT CAST(ROUND(AVG(CAST(r.serviceScore AS double)), 1) AS double)
        FROM HotelReview r WHERE r.hotel.hotelId = :hotelId
    """)
    Double getAvgService(@Param("hotelId") Integer hotelId);

    @Query("SELECT COUNT(r) FROM HotelReview r WHERE r.hotel.hotelId = :hotelId AND r.status = :status")
    Integer countByHotelIdAndStatus(@Param("hotelId") Integer hotelId, @Param("status") String status);
}

