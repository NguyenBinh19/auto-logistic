package com.HTPj.htpj.dto.response.roomtype;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeListDetailResponse {
    private Integer roomTypeId;
    private Integer hotelId;
    private String roomCode;
    private String roomTitle;
    private String description;
    private Integer maxAdults;
    private Integer maxChildren;
    private BigDecimal roomArea;
    private String bedType;
    private List<String> amenities;
}
