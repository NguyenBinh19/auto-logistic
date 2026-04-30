package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
import com.HTPj.htpj.dto.response.addonservice.BookingAddonServiceResponse;
import com.HTPj.htpj.entity.AddonService;
import com.HTPj.htpj.entity.BookingAddonService;

public class AddonServiceMapper {

    public static AddonServiceResponse toResponse(AddonService entity) {
        return AddonServiceResponse.builder()
                .serviceId(entity.getServiceId())
                .hotelId(entity.getHotel().getHotelId())
                .serviceName(entity.getServiceName())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .netPrice(entity.getNetPrice())
                .publicPrice(entity.getPublicPrice())
                .unit(entity.getUnit())
                .imageUrl(entity.getImageUrl())
                .status(entity.getStatus())
                .requireServiceDate(entity.getRequireServiceDate())
                .requireFlightInfo(entity.getRequireFlightInfo())
                .requireSpecialNote(entity.getRequireSpecialNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static BookingAddonServiceResponse toBookingAddonResponse(BookingAddonService entity) {
        return BookingAddonServiceResponse.builder()
                .id(entity.getId())
                .bookingId(entity.getBooking().getBookingId())
                .serviceId(entity.getAddonService().getServiceId())
                .serviceName(entity.getAddonService().getServiceName())
                .category(entity.getAddonService().getCategory())
                .unit(entity.getAddonService().getUnit())
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .totalPrice(entity.getTotalPrice())
                .serviceDate(entity.getServiceDate())
                .flightNumber(entity.getFlightNumber())
                .flightTime(entity.getFlightTime())
                .specialNote(entity.getSpecialNote())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
