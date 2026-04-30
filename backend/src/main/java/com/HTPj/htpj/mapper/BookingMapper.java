package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.booking.BookingDetailResponse;
import com.HTPj.htpj.dto.response.booking.CreateBookingResponse;
import com.HTPj.htpj.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    CreateBookingResponse toResponse(Booking entity);

    @Mapping(source = "discountTotal", target = "discountAmount")
    @Mapping(target = "addonServices", ignore = true)
    @Mapping(target = "hotelAddress", ignore = true)
    @Mapping(target = "hotelName", ignore = true)
    @Mapping(target = "hotelStarRating", ignore = true)
    @Mapping(target = "roomDetails", ignore = true)
    BookingDetailResponse toBookingDetailResponse(Booking booking);


}