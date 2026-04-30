package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.addonservice.AddBookingAddonsRequest;
import com.HTPj.htpj.dto.request.addonservice.CreateAddonServiceRequest;
import com.HTPj.htpj.dto.request.addonservice.UpdateAddonServiceRequest;
import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
import com.HTPj.htpj.dto.response.addonservice.BookingAddonServiceResponse;
import com.HTPj.htpj.service.AddonServiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addon-services")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AddonServiceController {

    AddonServiceService addonServiceService;

    // UC-066: Tạo dịch vụ bổ trợ mới
    @PostMapping
    ApiResponse<AddonServiceResponse> create(@RequestBody CreateAddonServiceRequest request) {
        return ApiResponse.<AddonServiceResponse>builder()
                .result(addonServiceService.createService(request))
                .build();
    }

    // UC-067: Cập nhật dịch vụ bổ trợ
    @PutMapping("/{serviceId}")
    ApiResponse<AddonServiceResponse> update(
            @PathVariable Long serviceId,
            @RequestBody UpdateAddonServiceRequest request) {
        return ApiResponse.<AddonServiceResponse>builder()
                .result(addonServiceService.updateService(serviceId, request))
                .build();
    }

    // UC-068: Xóa (inactive) dịch vụ bổ trợ
    @DeleteMapping("/{serviceId}")
    ApiResponse<AddonServiceResponse> delete(@PathVariable Long serviceId) {
        return ApiResponse.<AddonServiceResponse>builder()
                .result(addonServiceService.deleteService(serviceId))
                .build();
    }

    // Toggle trạng thái active/inactive
    @PatchMapping("/{serviceId}/status")
    ApiResponse<AddonServiceResponse> toggleStatus(@PathVariable Long serviceId) {
        return ApiResponse.<AddonServiceResponse>builder()
                .result(addonServiceService.toggleStatus(serviceId))
                .build();
    }

    // Xem danh sách dịch vụ theo hotel (Hotel admin)
    @GetMapping
    ApiResponse<List<AddonServiceResponse>> getByHotel(
            @RequestParam Integer hotelId,
            @RequestParam(required = false) String category) {
        return ApiResponse.<List<AddonServiceResponse>>builder()
                .result(addonServiceService.getServicesByHotelId(hotelId, category))
                .build();
    }

    // Xem dịch vụ active theo hotel (Agency dùng khi checkout)
    @GetMapping("/active")
    ApiResponse<List<AddonServiceResponse>> getActiveByHotel(@RequestParam Integer hotelId) {
        return ApiResponse.<List<AddonServiceResponse>>builder()
                .result(addonServiceService.getActiveServicesByHotelId(hotelId))
                .build();
    }

    // UC-026: Thêm dịch vụ vào booking
    @PostMapping("/booking")
    ApiResponse<List<BookingAddonServiceResponse>> addToBooking(@RequestBody AddBookingAddonsRequest request) {
        return ApiResponse.<List<BookingAddonServiceResponse>>builder()
                .result(addonServiceService.addServicesToBooking(request))
                .build();
    }

    // Xem dịch vụ đã đặt trong booking
    @GetMapping("/booking/{bookingId}")
    ApiResponse<List<BookingAddonServiceResponse>> getBookingAddons(@PathVariable Long bookingId) {
        return ApiResponse.<List<BookingAddonServiceResponse>>builder()
                .result(addonServiceService.getBookingAddonServices(bookingId))
                .build();
    }
}
