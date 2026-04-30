package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
import com.HTPj.htpj.entity.RoomHold;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoomHoldMapper {

    RoomHoldResponse toResponse(RoomHold entity);
}

