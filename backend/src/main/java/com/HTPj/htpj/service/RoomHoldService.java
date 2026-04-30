package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
import com.HTPj.htpj.dto.request.roomHold.ExtendRoomHoldRequest;
import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;

public interface RoomHoldService {
    RoomHoldResponse createHold(CreateRoomHoldRequest request);
    RoomHoldResponse extendHold(ExtendRoomHoldRequest request);

}