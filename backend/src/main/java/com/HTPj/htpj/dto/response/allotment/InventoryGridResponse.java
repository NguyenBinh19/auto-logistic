package com.HTPj.htpj.dto.response.allotment;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryGridResponse {

    private Integer roomTypeId;
    private String roomTypeName;
    private Integer totalPhysicalRooms;
    private List<RoomAllotmentResponse> dates;
}
