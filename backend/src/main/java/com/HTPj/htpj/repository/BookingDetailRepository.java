package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.BookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {
    // JOIN FETCH bd.roomType để tránh N+1 khi truy cập roomType sau này
    @Query("""
        SELECT bd
        FROM BookingDetail bd
        JOIN FETCH bd.roomType
        JOIN bd.booking b
        WHERE b.hotelId = :hotelId
          AND b.bookingStatus IN :statuses
          AND b.checkInDate < :checkOut
          AND b.checkOutDate > :checkIn
    """)
    List<BookingDetail> findOverlappingBookings(
            @Param("hotelId") Integer hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<String> statuses
    );

    @Query("""
        SELECT bd
        FROM BookingDetail bd
        JOIN FETCH bd.roomType
        JOIN bd.booking b
        WHERE b.hotelId IN :hotelIds
          AND b.bookingStatus IN :statuses
          AND b.checkInDate < :checkOut
          AND b.checkOutDate > :checkIn
    """)
    List<BookingDetail> findOverlappingBookingsForHotels(
            @Param("hotelIds") List<Integer> hotelIds,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<String> statuses
    );
}
