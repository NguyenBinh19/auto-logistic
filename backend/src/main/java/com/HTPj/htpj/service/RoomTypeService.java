package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.request.roomtype.UpdateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeListDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomTypeService {

    RoomTypeDetailResponse createRoomType(CreateRoomTypeRequest request, MultipartFile[] files);

    List<RoomTypeResponse> getRoomTypesByHotelId();

    RoomTypeDetailResponse getRoomTypeDetail(Integer roomTypeId);

    RoomTypeDetailResponse inactiveRoomType(Integer roomTypeId);

    RoomTypeDetailResponse updateRoomType(Integer roomTypeId, UpdateRoomTypeRequest request, MultipartFile[] files);

    List<RoomTypeListDetailResponse> getRoomTypeDetailsByHotelId(Integer hotelId);


}
