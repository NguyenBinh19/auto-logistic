package com.HTPj.htpj.dto.request.roomHold;


import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomHoldRequest {

    private Integer hotelId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private List<RoomTypeHoldItemRequest> items;
}

