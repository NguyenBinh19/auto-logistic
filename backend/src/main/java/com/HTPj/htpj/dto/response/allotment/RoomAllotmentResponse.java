package com.HTPj.htpj.dto.response.allotment;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAllotmentResponse {

    private Long allotmentId;
    private Integer roomTypeId;
    private String roomTypeName;
    private LocalDate date;
    private Integer totalPhysicalRooms;
    private Integer allotment;
    private Integer soldCount;
    private Integer available;
    private Boolean stopSell;
    private String status; // AVAILABLE, HURRY, SOLD_OUT, STOP_SELL
    private LocalDateTime updatedAt;
}
