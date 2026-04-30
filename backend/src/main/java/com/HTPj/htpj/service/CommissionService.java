package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
import com.HTPj.htpj.dto.request.commission.DeleteCommissionRequest;
import com.HTPj.htpj.dto.request.commission.UpdateCommissionRequest;
import com.HTPj.htpj.dto.response.commision.CommissionDetailResponse;
import com.HTPj.htpj.dto.response.commision.CommissionLogResponse;
import com.HTPj.htpj.dto.response.commision.CommissionResponse;
import com.HTPj.htpj.dto.response.commision.HotelUsingDealResponse;

import java.util.List;

public interface CommissionService {
    String create(CreateCommissionRequest request);

    String delete(Long commissionId, DeleteCommissionRequest request);

    List<CommissionResponse> getAll();

    CommissionDetailResponse getDetail(Long commissionId);

    String update(UpdateCommissionRequest request);
    //active case deal
    String activeCommission(Long commissionId);

    //count hotel use deal
    HotelUsingDealResponse getHotelsUsingDeal(Long commissionId);

    //set to default:
    String setDefaultCommission(Integer hotelId);

    //admin
    List<CommissionLogResponse> getAllCommissionLogs();

    //hotel
    List<CommissionLogResponse> getHotelCommissionLogs();
}
