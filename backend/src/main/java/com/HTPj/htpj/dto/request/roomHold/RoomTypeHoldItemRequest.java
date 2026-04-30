package com.HTPj.htpj.dto.request.roomHold;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeHoldItemRequest {
    private Integer roomTypeId;
    private Integer quantity;
}
