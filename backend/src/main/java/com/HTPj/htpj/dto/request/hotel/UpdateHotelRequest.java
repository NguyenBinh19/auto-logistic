package com.HTPj.htpj.dto.request.hotel;

import lombok.*;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHotelRequest {
    String hotelName;
    String address;
    String city;
    String country;
    String phone;
    String description;
    String email;

    List<String> amenitiesList;

    List<Integer> deleteImageIds;

    Integer coverImageId;
}
