package com.HTPj.htpj.dto.response.booking;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailabilityResponse {
    private Integer roomTypeId;
    private String roomTitle;
    private BigDecimal price;
    private Integer quantityAvaiable;
    private String status;
}
