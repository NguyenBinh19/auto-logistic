package com.HTPj.htpj.dto.response.hotel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelImageResponse {
    private Integer imageId;
    private String imageUrl;
}
