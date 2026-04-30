package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.booking.CancelBookingRequest;
import com.HTPj.htpj.dto.request.booking.CheckinRequest;
import com.HTPj.htpj.dto.request.booking.CreateBookingRequest;
import com.HTPj.htpj.dto.request.booking.NoShowRequest;
import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.booking.UpdateGuestRequest;
import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
import com.HTPj.htpj.dto.request.roomHold.ExtendRoomHoldRequest;
import com.HTPj.htpj.dto.response.booking.BookingDetailResponse;
import com.HTPj.htpj.dto.response.booking.BookingHistoryResponse;
import com.HTPj.htpj.dto.response.booking.CancelBookingResponse;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.dto.response.booking.DepartureListResponse;
import com.HTPj.htpj.dto.response.booking.ListAllBookingsResponse;
import com.HTPj.htpj.dto.response.booking.NoShowResponse;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
import com.HTPj.htpj.service.BookingService;
import com.HTPj.htpj.service.RoomHoldService;
import com.HTPj.htpj.service.VoucherService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController {
    BookingService bookingService;
    RoomHoldService roomHoldService;
    VoucherService voucherService;

    //Check room avai for booking
    @PostMapping("/room_avai")
    ApiResponse<List<RoomAvailabilityResponse>> checkAvailability(
            @RequestBody RoomAvailabilityRequest request
    ) {
        return ApiResponse.<List<RoomAvailabilityResponse>>builder()
                .result(bookingService.checkAvailability(request))
                .build();
    }

    //hold room
    @PostMapping("/room_holds")
    public ApiResponse<RoomHoldResponse> createHold(
            @RequestBody CreateRoomHoldRequest request
    ) {
        return ApiResponse.<RoomHoldResponse>builder()
                .result(roomHoldService.createHold(request))
                .build();
    }

    @PostMapping("/room_holds/extend")
    public ApiResponse<RoomHoldResponse> extendHold(
            @RequestBody ExtendRoomHoldRequest request
    ) {
        return ApiResponse.<RoomHoldResponse>builder()
                .result(roomHoldService.extendHold(request))
                .build();
    }

    //booking
    @PostMapping("/create")
    ApiResponse<CreateBookingResponse> createBooking(
            @RequestBody CreateBookingRequest request
    ) {
        return ApiResponse.<CreateBookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }

    //UC79
    @GetMapping("/listAll")
    ApiResponse<List<ListAllBookingsResponse>> getAllBookings() {
        return ApiResponse.<List<ListAllBookingsResponse>>builder()
                .result(bookingService.getAllBookings())
                .build();
    }

    @GetMapping("/listAllByHotelId")
    ApiResponse<List<ListAllBookingsResponse>> getAllBookingsByHotelId(
            @RequestParam Integer hotelId
    ) {
        return ApiResponse.<List<ListAllBookingsResponse>>builder()
                .result(bookingService.getAllBookingsByHotelId(hotelId))
                .build();
    }

    // UC-029: Lịch sử đặt phòng (phân trang)
    @GetMapping("/history")
    ApiResponse<Page<BookingHistoryResponse>> getBookingHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<BookingHistoryResponse>>builder()
                .result(bookingService.getBookingHistory(page, size))
                .build();
    }

    // UC-030: Chi tiết booking theo booking code
    @GetMapping("/detail/{bookingCode}")
    ApiResponse<BookingDetailResponse> getBookingDetail(
            @PathVariable String bookingCode
    ) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.getBookingDetail(bookingCode))
                .build();
    }

    @GetMapping("/detail-with-nouid/{bookingCode}")
    ApiResponse<BookingDetailResponse> getBookingDetailWithNoUserId(
            @PathVariable String bookingCode
    ) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.getBookingDetailWithNoUserId(bookingCode))
                .build();
    }
    //UC28
    @PostMapping("/update-guest")
    ApiResponse<BookingDetailResponse> updateGuestInformation(
            @RequestBody UpdateGuestRequest request
    ) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.updateGuestInformation(request))
                .build();
    }

    @GetMapping("/checkin/today")
    ApiResponse<List<ListAllBookingsResponse>> getTodayCheckinBookings() {
        return ApiResponse.<List<ListAllBookingsResponse>>builder()
                .result(bookingService.getTodayCheckinBookings())
                .build();
    }

    @GetMapping("/checkin/{date}")
    ApiResponse<List<ListAllBookingsResponse>> getBookingsByCheckinDate(
            @PathVariable LocalDate date
    ) {
        return ApiResponse.<List<ListAllBookingsResponse>>builder()
                .result(bookingService.getBookingsByCheckinDate(date))
                .build();
    }

    // =========================================================================
    // UC-027: Download Booking Voucher (PDF)
    // =========================================================================
    @GetMapping("/voucher/{bookingCode}")
    ResponseEntity<byte[]> downloadVoucher(@PathVariable String bookingCode) {
        byte[] pdfData = voucherService.generateVoucherPdf(bookingCode);
        String fileName = voucherService.getVoucherFileName(bookingCode);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }

    // =========================================================================
    // UC-051: View Daily Departure List
    // =========================================================================
    @GetMapping("/checkout/today")
    ApiResponse<List<DepartureListResponse>> getTodayDepartures() {
        return ApiResponse.<List<DepartureListResponse>>builder()
                .result(bookingService.getTodayDepartures())
                .build();
    }

    @GetMapping("/checkout/{date}")
    ApiResponse<List<DepartureListResponse>> getDeparturesByDate(@PathVariable LocalDate date) {
        return ApiResponse.<List<DepartureListResponse>>builder()
                .result(bookingService.getDeparturesByDate(date))
                .build();
    }

    // UC-051: Perform checkout
    @PostMapping("/checkout/{bookingCode}/process")
    ApiResponse<BookingDetailResponse> performCheckout(@PathVariable String bookingCode) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.performCheckout(bookingCode))
                .build();
    }

    // UC-051: Express checkout (no bill)
    @PostMapping("/checkout/{bookingCode}/express")
    ApiResponse<BookingDetailResponse> expressCheckout(@PathVariable String bookingCode) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.expressCheckout(bookingCode))
                .build();
    }

    // =========================================================================
    // UC-031: Cancel Booking Order
    // =========================================================================
    @PostMapping("/cancel")
    ApiResponse<CancelBookingResponse> cancelBooking(@RequestBody CancelBookingRequest request) {
        return ApiResponse.<CancelBookingResponse>builder()
                .result(bookingService.cancelBooking(request))
                .build();
    }

    // =========================================================================
    // UC-052: Check-in / Check-out Guest
    // =========================================================================
    @PostMapping("/checkin")
    ApiResponse<BookingDetailResponse> checkinGuest(@RequestBody CheckinRequest request) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.checkinGuest(request))
                .build();
    }

    @PostMapping("/checkout-guest/{bookingCode}")
    ApiResponse<BookingDetailResponse> checkoutGuest(@PathVariable String bookingCode) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.checkoutGuest(bookingCode))
                .build();
    }

    // =========================================================================
    // UC-053: Report No-show
    // =========================================================================
    @PostMapping("/no-show")
    ApiResponse<NoShowResponse> reportNoShow(@RequestBody NoShowRequest request) {
        return ApiResponse.<NoShowResponse>builder()
                .result(bookingService.reportNoShow(request))
                .build();
    }

    //get booking detail by id
    @GetMapping("/detail/id/{bookingId}")
    ApiResponse<BookingDetailResponse> getBookingDetailById(
            @PathVariable Long bookingId
    ) {
        return ApiResponse.<BookingDetailResponse>builder()
                .result(bookingService.getBookingDetailById(bookingId))
                .build();
    }

}
