package com.HTPj.htpj.dto.response.hotel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelListResponse {
    private Integer hotelId;
    private String hotelName;
    private String phone;
    private String address;
    private String status;
}
