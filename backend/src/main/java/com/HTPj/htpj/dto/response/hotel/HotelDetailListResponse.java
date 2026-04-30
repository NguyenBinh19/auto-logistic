package com.HTPj.htpj.dto.response.hotel;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDetailListResponse {

    Integer hotelId;
    String hotelName;
    String address;
    String city;
    String country;
    String phone;
    String description;
    Integer starRating;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String email;
    List<HotelImageResponse> images;
    List<String> amenitiesList;
    Double avgRating;
    Integer totalReviews;
    VerificationInfoResponse verification;
    BigDecimal commissionValue;
    String rateType;
    String commissionType;
    LocalDateTime commissionUpdatedAt;
    String commissionUpdatedBy;
}