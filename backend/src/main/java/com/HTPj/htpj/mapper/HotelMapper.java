package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.hotel.HotelDetailListResponse;
import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
import com.HTPj.htpj.dto.response.hotel.HotelListResponse;
import com.HTPj.htpj.dto.response.hotel.HotelResponse;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.PartnerVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HotelMapper {

    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "coverImage", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    HotelResponse toHotelResponse(Hotel hotel);

    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "minPrice", ignore = true)
    @Mapping(target = "totalAvailableRooms", ignore = true)
    HotelDetailResponse toHotelDetailResponse(Hotel hotel);


    HotelListResponse toHotelListResponse(Hotel hotel);

    @Mapping(target = "amenitiesList", ignore = true)
    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "verification", ignore = true)
    HotelDetailListResponse toHotelDetailListResponse(Hotel hotel);

    @Mapping(source = "id", target = "verificationId")
    @Mapping(source = "legalInformation.id", target = "legalInformationId")
    @Mapping(source = "legalInformation.legalName", target = "legalName")
    @Mapping(source = "legalInformation.taxCode", target = "taxCode")
    @Mapping(source = "legalInformation.businessLicenseNumber", target = "businessLicenseNumber")
    @Mapping(source = "legalInformation.representativeName", target = "representativeName")
    @Mapping(source = "legalInformation.representativeCICNumber", target = "representativeCICNumber")
    VerificationInfoResponse toVerificationInfoResponse(PartnerVerification verification);



}
