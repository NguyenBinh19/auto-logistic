package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.hotel.BankInfoRequest;
import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
import com.HTPj.htpj.dto.response.hotel.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HotelService {

    List<HotelResponse> getHotelsForView();

    HotelDetailResponse getHotelDetailForView(Integer hotelId);

    List<HotelDetailResponse> searchHotels(String keyword, java.time.LocalDate checkIn, java.time.LocalDate checkOut, Integer rooms, Integer adults, Integer children);

    List<HotelListResponse> getAllHotels();

    //admin
    HotelDetailListResponse getHotelDetail(Integer hotelId);

    //hotel
    HotelDetailListResponse getHotelDetail();

    HotelDetailListResponse updateHotel(UpdateHotelRequest request, MultipartFile[] newImages);

    //bank
    BankInfoResponse getBankInfo(Integer hotelId);

    void updateBankInfo(Integer hotelId, BankInfoRequest request);
}
