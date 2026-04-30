package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.allotment.BulkAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.SingleAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.StopSellRequest;
import com.HTPj.htpj.dto.response.allotment.InventoryGridResponse;
import com.HTPj.htpj.dto.response.allotment.RoomAllotmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface RoomAllotmentService {

    List<InventoryGridResponse> getInventoryGrid(LocalDate startDate, LocalDate endDate);

    List<RoomAllotmentResponse> bulkUpdateAllotment(BulkAllotmentUpdateRequest request);

    RoomAllotmentResponse updateSingleAllotment(SingleAllotmentUpdateRequest request);

    List<RoomAllotmentResponse> setStopSell(StopSellRequest request);

    List<RoomAllotmentResponse> removeStopSell(StopSellRequest request);
}
