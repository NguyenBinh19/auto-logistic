package com.HTPj.htpj.dto.response.hotel;

public interface HotelSearchProjection {

    Integer getHotelId();
    String getHotelName();
    String getAddress();
    String getCity();
    String getCountry();
    String getPhone();
    String getDescription();
    Integer getStarRating();
    Double getAvgRating();
    Integer getTotalReviews();
    String getAmenities();
}
