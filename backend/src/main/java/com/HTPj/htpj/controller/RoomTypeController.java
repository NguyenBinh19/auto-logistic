package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.request.roomtype.UpdateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeListDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.service.RoomTypeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/room-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoomTypeController {

    RoomTypeService roomTypeService;

    @PostMapping(consumes = "multipart/form-data")
    ApiResponse<RoomTypeDetailResponse> create(
            @RequestPart("data") CreateRoomTypeRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.createRoomType(request, files))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoomTypeResponse>> getRoomTypesByHotelId() {
        return ApiResponse.<List<RoomTypeResponse>>builder()
                .result(roomTypeService.getRoomTypesByHotelId())
                .build();
    }

    @GetMapping("/{roomTypeId}")
    ApiResponse<RoomTypeDetailResponse> getRoomTypeDetail(
            @PathVariable Integer roomTypeId
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.getRoomTypeDetail(roomTypeId))
                .build();
    }

    @GetMapping("/details")
    ApiResponse<List<RoomTypeListDetailResponse>> getRoomTypeDetailsByHotelId(
            @RequestParam Integer hotelId
    ) {
        return ApiResponse.<List<RoomTypeListDetailResponse>>builder()
                .result(roomTypeService.getRoomTypeDetailsByHotelId(hotelId))
                .build();
    }

    @DeleteMapping("/{roomTypeId}")
    ApiResponse<RoomTypeDetailResponse> deleteRoomType(
            @PathVariable Integer roomTypeId
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.inactiveRoomType(roomTypeId))
                .build();
    }

//    @PutMapping("/{roomTypeId}")
//    ApiResponse<RoomTypeDetailResponse> updateRoomType(
//            @PathVariable Integer roomTypeId,
//            @RequestBody UpdateRoomTypeRequest request
//    ) {
//        return ApiResponse.<RoomTypeDetailResponse>builder()
//                .result(roomTypeService.updateRoomType(roomTypeId, request))
//                .build();
//    }
    @PutMapping(value = "/{roomTypeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<RoomTypeDetailResponse> updateRoomType(
            @PathVariable Integer roomTypeId,
            @RequestPart("data") UpdateRoomTypeRequest request,
            @RequestPart(value = "newImages", required = false) MultipartFile[] newImages
    ) {
        return ApiResponse.<RoomTypeDetailResponse>builder()
                .result(roomTypeService.updateRoomType(roomTypeId, request, newImages))
                .build();
    }






}
