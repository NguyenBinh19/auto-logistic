package com.HTPj.htpj.dto.request.roomtype;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoomTypeRequest {
    private String roomTitle;
    private String description;
    private BigDecimal basePrice;
    private Integer maxAdults;
    private Integer maxChildren;
    private BigDecimal roomArea;
    private String bedType;
    private Integer totalRooms;
    private List<String> amenities;
    private List<Integer> deletedImageIds;
}
