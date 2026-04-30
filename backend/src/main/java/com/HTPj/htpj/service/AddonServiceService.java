package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.addonservice.AddBookingAddonsRequest;
import com.HTPj.htpj.dto.request.addonservice.CreateAddonServiceRequest;
import com.HTPj.htpj.dto.request.addonservice.UpdateAddonServiceRequest;
import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
import com.HTPj.htpj.dto.response.addonservice.BookingAddonServiceResponse;

import java.util.List;

public interface AddonServiceService {

    // UC-066: Tạo dịch vụ bổ trợ
    AddonServiceResponse createService(CreateAddonServiceRequest request);

    // UC-067: Cập nhật dịch vụ bổ trợ
    AddonServiceResponse updateService(Long serviceId, UpdateAddonServiceRequest request);

    // UC-068: Xóa dịch vụ bổ trợ (đặt inactive)
    AddonServiceResponse deleteService(Long serviceId);

    // Toggle trạng thái active/inactive
    AddonServiceResponse toggleStatus(Long serviceId);

    // Xem danh sách dịch vụ theo khách sạn
    List<AddonServiceResponse> getServicesByHotelId(Integer hotelId, String category);

    // Xem dịch vụ active theo khách sạn (Agency dùng khi đặt phòng)
    List<AddonServiceResponse> getActiveServicesByHotelId(Integer hotelId);

    // UC-026: Thêm dịch vụ vào booking
    List<BookingAddonServiceResponse> addServicesToBooking(AddBookingAddonsRequest request);

    // Xem dịch vụ đã đặt trong một booking
    List<BookingAddonServiceResponse> getBookingAddonServices(Long bookingId);
}
