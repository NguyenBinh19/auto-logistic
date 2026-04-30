package com.HTPj.htpj.dto.response.commision;

import com.HTPj.htpj.dto.response.hotel.HotelListResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelUsingDealResponse {
    private Long commissionId;
    private Integer totalHotel;
    private List<HotelListResponse> hotels;
}
