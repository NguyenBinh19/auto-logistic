package com.HTPj.htpj.dto.response.hotel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {
    private Integer hotelId;
    private String hotelName;
    private String city;
    private String country;
    private Integer starRating;
    private String email;

    private String coverImage;

    private Double avgRating;
    private Integer totalReviews;
}
