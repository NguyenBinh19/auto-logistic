package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.BookingAddonService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingAddonServiceRepository extends JpaRepository<BookingAddonService, Long> {

    // JOIN FETCH addonService để tránh N+1 khi lay tên dịch vụ
    @Query("""
        SELECT bas FROM BookingAddonService bas
        JOIN FETCH bas.addonService
        WHERE bas.booking.bookingId = :bookingId
    """)
    List<BookingAddonService> findByBookingIdWithService(@Param("bookingId") Long bookingId);
}
