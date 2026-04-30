package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.booking.CancelBookingRequest;
import com.HTPj.htpj.dto.request.booking.CheckinRequest;
import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.NoShowRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.booking.UpdateGuestRequest;
import com.HTPj.htpj.dto.response.booking.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    List<RoomAvailabilityResponse> checkAvailability(RoomAvailabilityRequest request);

    CreateBookingResponse createBooking(CreateBookingRequest request);

    // UC-029: Xem lịch sử đặt phòng của agency user
    Page<BookingHistoryResponse> getBookingHistory(int page, int size);

    // UC-030: Xem chi tiết một booking
    BookingDetailResponse getBookingDetail(String bookingCode);

    BookingDetailResponse getBookingDetailWithNoUserId(String bookingCode);
    //Uc79
    List<ListAllBookingsResponse> getAllBookings();

    List<ListAllBookingsResponse> getAllBookingsByHotelId(Integer hotelId);

    //Uc28:
    BookingDetailResponse updateGuestInformation(UpdateGuestRequest request);
    List<ListAllBookingsResponse> getTodayCheckinBookings();

    List<ListAllBookingsResponse> getBookingsByCheckinDate(LocalDate date);

    // UC-051: View Daily Departure List
    List<DepartureListResponse> getTodayDepartures();

    List<DepartureListResponse> getDeparturesByDate(LocalDate date);

    // UC-051: Perform checkout
    BookingDetailResponse performCheckout(String bookingCode);

    // UC-051: Express checkout (no bill)
    BookingDetailResponse expressCheckout(String bookingCode);

    // UC-031: Cancel Booking Order
    CancelBookingResponse cancelBooking(CancelBookingRequest request);

    // UC-052: Check-in Guest
    BookingDetailResponse checkinGuest(CheckinRequest request);

    // UC-052: Check-out Guest (update from IN_HOUSE to COMPLETED)
    BookingDetailResponse checkoutGuest(String bookingCode);

    // UC-053: Report No-show
    NoShowResponse reportNoShow(NoShowRequest request);

    void recalculateDebts();

    BookingDetailResponse getBookingDetailById(Long bookingId);
}
