package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.hotel.BankInfoRequest;
import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
import com.HTPj.htpj.dto.response.hotel.*;
import com.HTPj.htpj.service.HotelService;
import com.HTPj.htpj.service.impl.HotelServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelController {

    HotelService hotelServiceImpl;

    @GetMapping
    public ApiResponse<List<HotelResponse>> getHotelsForView() {
        return ApiResponse.<List<HotelResponse>>builder()
                .result(hotelServiceImpl.getHotelsForView())
                .build();
    }

    @GetMapping("/{hotelId}")
    public ApiResponse<HotelDetailResponse> getHotelDetailForView(
            @PathVariable Integer hotelId
    ) {
        return ApiResponse.<HotelDetailResponse>builder()
                .result(hotelServiceImpl.getHotelDetailForView(hotelId))
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<HotelDetailResponse>> searchHotels(
            @RequestParam String keyword,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkIn,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkOut,
            @RequestParam(required = false) Integer rooms,
            @RequestParam(required = false) Integer adults,
            @RequestParam(required = false) Integer children
    ) {
        return ApiResponse.<List<HotelDetailResponse>>builder()
                .result(hotelServiceImpl.searchHotels(keyword, checkIn, checkOut, rooms, adults, children))
                .build();
    }

    //UC-075 - View Partner List
    @GetMapping("/list")
    public ApiResponse<List<HotelListResponse>> getAllHotels() {
        return ApiResponse.<List<HotelListResponse>>builder()
                .result(hotelServiceImpl.getAllHotels())
                .build();
    }
    //UC-076 - View Partner Details(admin)
    @GetMapping("/list/{hotelId}")
    public ApiResponse<HotelDetailListResponse> getHotelDetail(
            @PathVariable Integer hotelId) {

        return ApiResponse.<HotelDetailListResponse>builder()
                .result(hotelServiceImpl.getHotelDetail(hotelId))
                .build();
    }

    @GetMapping("/detail")
    public ApiResponse<HotelDetailListResponse> getHotelDetail() {

        return ApiResponse.<HotelDetailListResponse>builder()
                .result(hotelServiceImpl.getHotelDetail())
                .build();
    }

    //for hotel
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<HotelDetailListResponse> updateHotel(
            @RequestPart("data") UpdateHotelRequest request,
            @RequestPart(value = "newImages", required = false) MultipartFile[] newImages
    ) {

        return ApiResponse.<HotelDetailListResponse>builder()
                .result(hotelServiceImpl.updateHotel(request, newImages))
                .build();
    }

    @GetMapping("/{hotelId}/bank-info")
    public ApiResponse<BankInfoResponse> getBankInfo(@PathVariable Integer hotelId) {
        return ApiResponse.<BankInfoResponse>builder()
                .result(hotelServiceImpl.getBankInfo(hotelId))
                .build();
    }

    @PutMapping("/{hotelId}/bank-info")
    public ApiResponse<String> updateBankInfo(
            @PathVariable Integer hotelId,
            @RequestBody BankInfoRequest request) {
        hotelServiceImpl.updateBankInfo(hotelId, request);
        return ApiResponse.<String>builder()
                .result("Bank information updated successfully")
                .build();
    }
}
