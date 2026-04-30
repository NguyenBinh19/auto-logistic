package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.financial.MarkAsPaidRequest;
import com.HTPj.htpj.dto.request.financial.PayoutListRequest;
import com.HTPj.htpj.dto.request.financial.ResolveDisputeRequest;
import com.HTPj.htpj.dto.response.financial.DisputeDetailResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import com.HTPj.htpj.service.PayoutStatementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/payout")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PayoutAdminController {

    PayoutStatementService payoutStatementService;

    /**
     * UC-088: View Payout List (Admin)
     */
    @GetMapping("/list")
    ApiResponse<PayoutListResponse> getPayoutList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd,
            @RequestParam(required = false) Integer hotelId,
            @RequestParam(required = false, defaultValue = "false") Boolean includeDisputed
    ) {
        PayoutListRequest request = new PayoutListRequest();
        request.setStatus(status);
        request.setPeriodStart(periodStart);
        request.setPeriodEnd(periodEnd);
        request.setHotelId(hotelId);
        request.setIncludeDisputed(includeDisputed);

        return ApiResponse.<PayoutListResponse>builder()
                .result(payoutStatementService.getPayoutList(request))
                .build();
    }

    /**
     * UC-088: View statement detail (Admin)
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
     * UC-088.1: Export Batch Payment File — marks selected as PROCESSING
     */
//    @PostMapping("/export-batch")
//    ApiResponse<List<PayoutStatementResponse>> exportBatchPayment(
//            @RequestBody List<Long> statementIds
//    ) {
//        return ApiResponse.<List<PayoutStatementResponse>>builder()
//                .result(payoutStatementService.exportBatchPayment(statementIds))
//                .build();
//    }

    /**
     * UC-088.2: Mark As Paid (Manual Reconciliation)
     */
    @PostMapping(value = "/mark-paid", consumes = "multipart/form-data")
    ApiResponse<List<PayoutStatementResponse>> markAsPaid(
            @RequestPart("data") MarkAsPaidRequest request,
            @RequestPart(value = "proofImage", required = false) MultipartFile proofImage
    ) {
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .result(payoutStatementService.markAsPaid(request, proofImage))
                .build();
    }


    /**
     * Generate payout statements for the current billing cycle (26th prev month - 25th this month).
     * Can also specify custom period with periodStart and periodEnd params.
     */
    @PostMapping("/generate")
    ApiResponse<List<PayoutStatementResponse>> generateStatements(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd
    ) {
        List<PayoutStatementResponse> result;
        if (periodStart != null && periodEnd != null) {
            result = payoutStatementService.generateStatementsForPeriod(periodStart, periodEnd);
        } else {
            result = payoutStatementService.generateCurrentCycleStatements();
        }
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .message("Đã tạo thành công " + result.size() + " bản sao kê")
                .result(result)
                .build();
    }

    @PostMapping(value = "/resolve", consumes = "multipart/form-data")
    public ApiResponse<Void> resolveDispute(
            @RequestPart("data") ResolveDisputeRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files
    ) {
        payoutStatementService.resolveDispute(request, files);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/dispute-detail/{statementId}")
    ApiResponse<DisputeDetailResponse> getDisputeDetail(
            @PathVariable Long statementId
    ) {
        return ApiResponse.<DisputeDetailResponse>builder()
                .result(payoutStatementService.getDisputeDetail(statementId))
                .build();
    }

    @GetMapping("/disputed")
    public ApiResponse<List<PayoutStatementResponse>> getDisputedStatements() {
        return ApiResponse.<List<PayoutStatementResponse>>builder()
                .result(payoutStatementService.getDisputedStatements())
                .build();
    }
}
