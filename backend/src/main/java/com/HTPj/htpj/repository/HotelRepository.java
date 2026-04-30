package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.response.hotel.HotelSearchProjection;
import com.HTPj.htpj.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {

    Optional<Hotel> findByHotelIdAndStatus(Integer hotelId, String status);
    List<Hotel> findByStatus(String status);
    @Query(value = """
    SELECT h.hotel_id as hotelId,
           h.hotel_name as hotelName,
           h.address as address,
           h.city as city,
           h.country as country,
           h.phone as phone,
           h.description as description,
           h.star_rating as starRating,
           COALESCE(AVG(r.rating_score), 0) as avgRating,
           COUNT(r.review_id) as totalReviews,
           h.amenities as amenities
    FROM hotels h
    LEFT JOIN hotel_reviews r ON h.hotel_id = r.hotel_id
    WHERE h.status = 'ACTIVE'
      AND (
           REPLACE(REPLACE(h.hotel_name, N'đ', N'd'), N'Đ', N'D') COLLATE Latin1_General_100_CI_AI
                LIKE N'%' + REPLACE(REPLACE(CAST(:keyword AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') + N'%'
        OR REPLACE(REPLACE(h.address, N'đ', N'd'), N'Đ', N'D') COLLATE Latin1_General_100_CI_AI
                LIKE N'%' + REPLACE(REPLACE(CAST(:keyword AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') + N'%'
        OR REPLACE(REPLACE(h.city, N'đ', N'd'), N'Đ', N'D') COLLATE Latin1_General_100_CI_AI
                LIKE N'%' + REPLACE(REPLACE(CAST(:keyword AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') + N'%'
        OR REPLACE(REPLACE(h.country, N'đ', N'd'), N'Đ', N'D') COLLATE Latin1_General_100_CI_AI
                LIKE N'%' + REPLACE(REPLACE(CAST(:keyword AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') + N'%'
        OR REPLACE(REPLACE(CAST(h.description AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') COLLATE Latin1_General_100_CI_AI
                LIKE N'%' + REPLACE(REPLACE(CAST(:keyword AS NVARCHAR(MAX)), N'đ', N'd'), N'Đ', N'D') + N'%'
      )
    GROUP BY h.hotel_id, h.hotel_name, h.address,
             h.city, h.country, h.phone,
             h.description, h.star_rating, h.amenities
    """, nativeQuery = true)
    List<HotelSearchProjection> searchHotels(@Param("keyword") String keyword);

    @Query("SELECT COALESCE(MAX(h.hotelId),0) + 1 FROM Hotel h")
    Integer generateHotelId();

    List<Hotel> findByCommissionId(Long commissionId);

    @Query("""
    SELECT h FROM Hotel h
    WHERE h.commissionId = :commissionId
    AND h.commissionType = 'DEAL'
    AND h.status = 'ACTIVE'
""")
    List<Hotel> findHotelUsingDeal(@Param("commissionId") Long commissionId);


}
