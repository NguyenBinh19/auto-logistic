package com.HTPj.htpj.dto.response.roomtype;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeResponse {
    private Integer roomTypeId;
    private Integer hotelId;
    private String roomCode;
    private String roomTitle;
    private BigDecimal basePrice;
    private Integer max_adults;
    private Integer max_children;
    private BigDecimal room_area;
    private Integer totalRooms;
    private String roomStatus;
}
