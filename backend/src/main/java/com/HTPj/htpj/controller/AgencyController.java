package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.CreditSummaryDto;
import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.dto.response.agency.AgencyUserBookingResponse;
import com.HTPj.htpj.service.AgencyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/agencies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AgencyController {
    private final AgencyService agencyService;

    @GetMapping
    public ApiResponse<List<AgencyResponse>> getAllAgencies() {
        return ApiResponse.<List<AgencyResponse>>builder()
                .result(agencyService.getAllAgencies())
                .build();
    }

    //admin
    @GetMapping("/{agencyId}")
    public ApiResponse<AgencyDetailResponse> getAgencyDetail(
            @PathVariable Long agencyId
    ) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.getAgencyDetail(agencyId))
                .build();
    }

    //agency
    @GetMapping("/detail")
    public ApiResponse<AgencyDetailResponse> getAgencyDetail() {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.getAgencyDetail())
                .build();
    }

    //agency
    @PutMapping("/update")
    public ApiResponse<AgencyDetailResponse> updateAgency(
            @RequestBody UpdateAgencyRequest request
    ) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.updateAgency(request))
                .build();
    }

    @GetMapping("/agency-detail/{agencyId}")
    public ApiResponse<AgencyDetailResponse> updateAgency(
            @PathVariable Long agencyId
    ) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.findAgencyFinanceInfo(agencyId))
                .build();
    }

    @GetMapping("/{agencyId}/finance")
    public ApiResponse<AgencyDetailResponse> getAgencyFinanceInfo(@PathVariable Long agencyId) {
        return ApiResponse.<AgencyDetailResponse>builder()
                .result(agencyService.findAgencyFinanceInfoHeader(agencyId))
                .build();
    }

    @GetMapping("/{agencyId}/credit-summary")
    public ApiResponse<CreditSummaryDto> getCreditSummary(@PathVariable Long agencyId) {
        return ApiResponse.<CreditSummaryDto>builder()
                .result(agencyService.getCreditSummary(agencyId))
                .build();
    }

    @PostMapping("/{agencyId}/pay-debt")
    public ApiResponse<String> payDebt(
            @PathVariable Long agencyId,
            @RequestParam BigDecimal payment) throws Exception {
        agencyService.payDebt(agencyId, payment);
        return ApiResponse.<String>builder()
                .result("Thanh toán nợ thành công")
                .build();
    }

    @GetMapping("/user-booking")
    public ApiResponse<List<AgencyUserBookingResponse>> getAgencyUserBookingSummary() {
        return ApiResponse.<List<AgencyUserBookingResponse>>builder()
                .result(agencyService.getAgencyUserBookingSummary())
                .build();
    }

}
