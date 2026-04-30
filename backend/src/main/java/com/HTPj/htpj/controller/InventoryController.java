package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.allotment.BulkAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.SingleAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.StopSellRequest;
import com.HTPj.htpj.dto.response.allotment.InventoryGridResponse;
import com.HTPj.htpj.dto.response.allotment.RoomAllotmentResponse;
import com.HTPj.htpj.service.RoomAllotmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryController {

    RoomAllotmentService roomAllotmentService;

    /**
     * UC-061: Get inventory grid for a hotel
     * Shows allotment, sold, available, stop-sell status per room type per date
     */
    @GetMapping("/grid")
    ApiResponse<List<InventoryGridResponse>> getInventoryGrid(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ApiResponse.<List<InventoryGridResponse>>builder()
                .result(roomAllotmentService.getInventoryGrid(
                        LocalDate.parse(startDate),
                        LocalDate.parse(endDate)))
                .build();
    }

    /**
     * UC-061: Bulk update allotment for a room type + date range
     */
    @PostMapping("/allotment/bulk")
    ApiResponse<List<RoomAllotmentResponse>> bulkUpdateAllotment(
            @RequestBody BulkAllotmentUpdateRequest request
    ) {
        return ApiResponse.<List<RoomAllotmentResponse>>builder()
                .result(roomAllotmentService.bulkUpdateAllotment(request))
                .message("Inventory updated")
                .build();
    }

    /**
     * UC-061: Update allotment for single date
     */
    @PutMapping("/allotment")
    ApiResponse<RoomAllotmentResponse> updateSingleAllotment(
            @RequestBody SingleAllotmentUpdateRequest request
    ) {
        return ApiResponse.<RoomAllotmentResponse>builder()
                .result(roomAllotmentService.updateSingleAllotment(request))
                .message("Inventory updated")
                .build();
    }

    /**
     * UC-062: Set stop-sell for room type + date range
     */
    @PostMapping("/stop-sell")
    ApiResponse<List<RoomAllotmentResponse>> setStopSell(
            @RequestBody StopSellRequest request
    ) {
        return ApiResponse.<List<RoomAllotmentResponse>>builder()
                .result(roomAllotmentService.setStopSell(request))
                .message("Restriction updated")
                .build();
    }

    /**
     * UC-062: Remove stop-sell (re-open sales)
     */
    @DeleteMapping("/stop-sell")
    ApiResponse<List<RoomAllotmentResponse>> removeStopSell(
            @RequestBody StopSellRequest request
    ) {
        return ApiResponse.<List<RoomAllotmentResponse>>builder()
                .result(roomAllotmentService.removeStopSell(request))
                .message("Restriction removed")
                .build();
    }
}
