package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeListDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.RoomType;

import java.util.List;

public class RoomTypeMapper {

    public static RoomTypeDetailResponse toDetailResponse(RoomType entity, List<String> amenities) {
        return RoomTypeDetailResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .description(entity.getDescription())
                .basePrice(entity.getBasePrice())
                .maxAdults(entity.getMaxAdults())
                .maxChildren(entity.getMaxChildren())
                .roomArea(entity.getRoomArea())
                .bedType(entity.getBedType())
                .totalRooms(entity.getTotalRooms())
                .amenities(amenities)
                .roomStatus(entity.getRoomStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static RoomTypeResponse toListResponse(RoomType entity) {
        return RoomTypeResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .basePrice(entity.getBasePrice())
                .max_adults(entity.getMaxAdults())
                .max_children(entity.getMaxChildren())
                .room_area(entity.getRoomArea())
                .totalRooms(entity.getTotalRooms())
                .roomStatus(entity.getRoomStatus())
                .build();
    }

    public static RoomTypeListDetailResponse toListDetailResponse(RoomType entity, List<String> amenities) {
        return RoomTypeListDetailResponse.builder()
                .roomTypeId(entity.getRoomTypeId())
                .hotelId(entity.getHotel().getHotelId())
                .roomCode(entity.getRoomCode())
                .roomTitle(entity.getRoomTitle())
                .description(entity.getDescription())
                .maxAdults(entity.getMaxAdults())
                .maxChildren(entity.getMaxChildren())
                .roomArea(entity.getRoomArea())
                .bedType(entity.getBedType())
                .amenities(amenities)
                .build();
    }
}
