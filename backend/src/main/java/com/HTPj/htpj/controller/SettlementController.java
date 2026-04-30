package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.financial.ConfirmPayoutRequest;
import com.HTPj.htpj.dto.request.financial.DisputePayoutRequest;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settlement")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SettlementController {

    PayoutStatementService payoutStatementService;

    /**
     * UC-070: List all statements for a hotel (Settlement Dashboard)
     */
    @GetMapping("/hotel/{hotelId}")
    ApiResponse<List<PayoutStatementResponse>> getHotelStatements(
            @PathVariable Integer hotelId
    ) {
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .result(payoutStatementService.getHotelStatements(hotelId))
                .build();
    }

    /**
     * UC-070: View statement detail with line items
     */
    @GetMapping("/detail/{statementId}")
    ApiResponse<PayoutStatementResponse> getStatementDetail(
            @PathVariable Long statementId
    ) {
        return ApiResponse.<PayoutStatementResponse>builder()
                .result(payoutStatementService.getStatementDetail(statementId))
                .build();
    }

    /**
     * UC-070: Confirm Payout Statement (Hotel Owner)
     */
    @PostMapping("/confirm")
    ApiResponse<PayoutStatementResponse> confirmPayout(
            @RequestBody ConfirmPayoutRequest request
    ) {
        return ApiResponse.<PayoutStatementResponse>builder()
                .result(payoutStatementService.confirmPayout(request))
                .build();
    }

    /**
     * UC-070.1: Dispute a Statement (Hotel Owner)
     */
    @PostMapping("/dispute")
    ApiResponse<PayoutStatementResponse> disputePayout(
            @RequestBody DisputePayoutRequest request
    ) {
        return ApiResponse.<PayoutStatementResponse>builder()
                .result(payoutStatementService.disputePayout(request))
                .build();
    }
}
