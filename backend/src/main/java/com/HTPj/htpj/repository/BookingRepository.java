package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.response.booking.DepartureListResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByBookingCode(String bookingCode);

    Optional<Booking> findByBookingCode(String bookingCode);

    // UC-029: Lịch sử đặt phòng — chỉ lấy bảng bookings, không JOIN thêm
    // (dữ liệu tổng hợp đã lưu sẵn trong bảng bookings)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.userId = :userId
        ORDER BY b.createdAt DESC
    """)
    Page<Booking> findHistoryByUserId(@Param("userId") String userId, Pageable pageable);

    // UC-030: Chi tiết booking — JOIN FETCH bookingDetails một lần, tránh N+1
    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.bookingDetails
        WHERE b.bookingCode = :bookingCode
          AND b.userId = :userId
    """)
    Optional<Booking> findDetailByBookingCodeAndUserId(
            @Param("bookingCode") String bookingCode,
            @Param("userId") String userId
    );

    @Query("""
        SELECT DISTINCT b FROM Booking b
        LEFT JOIN FETCH b.bookingDetails
        WHERE b.bookingCode = :bookingCode
    """)
    Optional<Booking> findDetailByBookingCode(
            @Param("bookingCode") String bookingCode
    );
    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        WHERE b.agencyId = :agencyId
        AND b.promotionCode = :code
        AND b.bookingStatus <> 'CANCELLED'
    """)
    Long countAgencyPromotionUsage(
            @Param("agencyId") Long agencyId,
            @Param("code") String code
    );

    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
        b.bookingCode,
        b.createdAt,
        b.guestName,
        a.agencyName,
        h.hotelName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN Hotel h ON b.hotelId = h.hotelId
    """)
    List<ListAllBookingsResponse> getAllBookingsSummary();

    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
        b.bookingCode,
        b.createdAt,
        b.guestName,
        a.agencyName,
        h.hotelName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN Hotel h ON b.hotelId = h.hotelId
    WHERE b.hotelId = :hotelId
    """)
    List<ListAllBookingsResponse> getAllBookingsSummaryByHotelId(@Param("hotelId") Integer hotelId);

    @Query("""
SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
    b.bookingCode,
    b.createdAt,
    b.guestName,
    a.agencyName,
    h.hotelName,
    b.checkInDate,
    b.checkOutDate,
    b.totalRooms,
    b.finalAmount,
    b.bookingStatus,
    b.paymentStatus
)
FROM Booking b
JOIN Agency a ON b.agencyId = a.agencyId
JOIN Hotel h ON b.hotelId = h.hotelId
WHERE b.hotelId = :hotelId
AND b.bookingStatus IN ('BOOKED', 'NO_SHOW')
AND b.checkInDate = :date
ORDER BY b.createdAt DESC
""")
    List<ListAllBookingsResponse> getBookingsByCheckinDate(
            @Param("hotelId") Integer hotelId,
            @Param("date") LocalDate date
    );


    @Query("""
SELECT new com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse(
    b.bookingCode,
    b.createdAt,
    b.guestName,
    a.agencyName,
    h.hotelName,
    b.checkInDate,
    b.checkOutDate,
    b.totalRooms,
    b.finalAmount,
    b.bookingStatus,
    b.paymentStatus
)
FROM Booking b
JOIN Agency a ON b.agencyId = a.agencyId
JOIN Hotel h ON b.hotelId = h.hotelId
WHERE b.hotelId = :hotelId
AND b.bookingStatus IN ('BOOKED', 'NO_SHOW')
AND b.checkInDate = CURRENT_DATE
ORDER BY b.createdAt DESC
""")
    List<ListAllBookingsResponse> getTodayCheckinBookings(
            @Param("hotelId") Integer hotelId
    );

    // UC-051: View Daily Departure List - bookings checking out today for a specific hotel
    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.DepartureListResponse(
        b.bookingCode,
        bd.roomTitle,
        bd.roomCode,
        b.guestName,
        a.agencyName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus,
        b.createdAt
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN BookingDetail bd ON bd.booking = b
    WHERE b.hotelId = :hotelId
    AND b.checkOutDate = CURRENT_DATE
    AND b.bookingStatus IN ('CHECKED-IN', 'COMPLETED')
    ORDER BY b.bookingStatus ASC, b.guestName ASC
    """)
    List<DepartureListResponse> getTodayDeparturesByHotelId(@Param("hotelId") Integer hotelId);

    // UC-051: View departures by specific date for a specific hotel
    @Query("""
    SELECT new com.HTPj.htpj.dto.response.booking.DepartureListResponse(
        b.bookingCode,
        bd.roomTitle,
        bd.roomCode,
        b.guestName,
        a.agencyName,
        b.checkInDate,
        b.checkOutDate,
        b.totalRooms,
        b.finalAmount,
        b.bookingStatus,
        b.paymentStatus,
        b.createdAt
    )
    FROM Booking b
    JOIN Agency a ON b.agencyId = a.agencyId
    JOIN BookingDetail bd ON bd.booking = b
    WHERE b.hotelId = :hotelId
    AND b.checkOutDate = :date
    AND b.bookingStatus IN ('CHECKED-IN', 'COMPLETED')
    ORDER BY b.bookingStatus ASC, b.guestName ASC
    """)
    List<DepartureListResponse> getDeparturesByHotelIdAndDate(
            @Param("hotelId") Integer hotelId,
            @Param("date") LocalDate date
    );

    // UC-051: Find booking by code and hotel for checkout operation
    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingDetails
    WHERE b.bookingCode = :bookingCode
    AND b.hotelId = :hotelId
    """)
    Optional<Booking> findByBookingCodeAndHotelId(
            @Param("bookingCode") String bookingCode,
            @Param("hotelId") Integer hotelId
    );

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.bookingDetails WHERE b.bookingId = :bookingId AND b.userId = :userId")
    Optional<Booking> findByIdAndUserId(@Param("bookingId") Long bookingId, @Param("userId") String userId);

    // Payout Statement: Find completed & paid bookings not yet processed, up to periodEnd
    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingDetails
    WHERE b.hotelId = :hotelId
      AND b.bookingStatus = 'COMPLETED'
      AND b.paymentStatus = 'PAID'
      AND (b.payoutProcessed = false OR b.payoutProcessed IS NULL)
      AND b.checkOutDate <= :periodEnd
    ORDER BY b.checkOutDate ASC
    """)
    List<Booking> findUnprocessedPaidBookingsByHotel(
            @Param("hotelId") Integer hotelId,
            @Param("periodEnd") LocalDate periodEnd
    );

    // Payout Statement: Get all distinct hotelIds with unprocessed paid bookings up to periodEnd
    @Query("""
    SELECT DISTINCT b.hotelId FROM Booking b
    WHERE b.bookingStatus = 'COMPLETED'
      AND b.paymentStatus = 'PAID'
      AND (b.payoutProcessed = false OR b.payoutProcessed IS NULL)
      AND b.checkOutDate <= :periodEnd
    """)
    List<Integer> findHotelIdsWithUnprocessedPaidBookings(
            @Param("periodEnd") LocalDate periodEnd
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.agencyId = :agencyId
    """)
    List<Booking> findByAgencyId(@Param("agencyId") Long agencyId);


    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingDetails
    WHERE b.hotelId = :hotelId
      AND b.bookingStatus IN :statuses
      AND b.checkOutDate > :startDate
      AND b.checkInDate <= :endDate
    """)
    List<Booking> findRevenueBookings(
            @Param("hotelId") Integer hotelId,
            @Param("statuses") List<String> statuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingDetails
    WHERE b.hotelId = :hotelId
      AND b.bookingStatus IN :statuses
      AND b.checkOutDate > :startDate
      AND b.checkInDate <= :endDate
      AND b.agencyId = :agencyId
    """)
    List<Booking> findRevenueBookingsByAgency(
            @Param("hotelId") Integer hotelId,
            @Param("statuses") List<String> statuses,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("agencyId") Long agencyId
    );
}