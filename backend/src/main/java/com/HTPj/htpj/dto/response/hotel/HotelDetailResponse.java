package com.HTPj.htpj.dto.response.hotel;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDetailResponse {

    private Integer hotelId;
    private String hotelName;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String description;
    private String email;

    private Integer starRating;

    private List<String> images;
    private List<String> amenities;

    private Double avgRating;
    private Integer totalReviews;

    private BigDecimal minPrice;
    private Integer totalAvailableRooms;
    private Integer totalMaxGuests;
    private Boolean suggested;
}

