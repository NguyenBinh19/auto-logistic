package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.rank.*;
import com.HTPj.htpj.dto.response.rank.*;
import com.HTPj.htpj.service.RankService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ranks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RankController {

    RankService rankService;

    @PostMapping
    public ApiResponse<String> createRank(@RequestBody CreateRankRequest request) {
        return ApiResponse.<String>builder()
                .result(rankService.createRank(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<String> updateRank(
            @PathVariable Integer id,
            @RequestBody UpdateRankRequest request) {

        return ApiResponse.<String>builder()
                .result(rankService.updateRank(id, request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RankResponse> getDetail(@PathVariable Integer id) {
        return ApiResponse.<RankResponse>builder()
                .result(rankService.getRankDetail(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<RankResponse>> getAll() {
        return ApiResponse.<List<RankResponse>>builder()
                .result(rankService.getAllRanks())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        return ApiResponse.<String>builder()
                .result(rankService.deleteRank(id))
                .build();
    }

    @PutMapping("/config-cycle")
    public ApiResponse<String> updateCycle(
            @RequestBody UpdateRankPeriodRequest request
    ) {
        return ApiResponse.<String>builder()
                .result(rankService.updateRankPeriod(request))
                .build();
    }

    @GetMapping("/config-cycle")
    public ApiResponse<String> getCycle(@RequestParam String type) {
        return ApiResponse.<String>builder()
                .result(rankService.getRankPeriod(type))
                .build();
    }

    @GetMapping("/config-cycles")
    public ApiResponse<RankPeriodResponse> getAllCycles() {
        return ApiResponse.<RankPeriodResponse>builder()
                .result(rankService.getAllRankPeriods())
                .build();
    }

    @GetMapping("/period/latest")
    public ApiResponse<RankDateResponse> getLatestPeriod() {
        return ApiResponse.<RankDateResponse>builder()
                .result(rankService.getLatestPeriod())
                .build();
    }

    @PostMapping("/upgrade")
    public ApiResponse<List<AgencyRankChangeResponse>> getUpgradeCandidates(
            @RequestBody RankEvaluateRequest request
    ) {
        return ApiResponse.<List<AgencyRankChangeResponse>>builder()
                .result(rankService.getUpgradeCandidates(request))
                .build();
    }

    @PostMapping("/downgrade")
    public ApiResponse<List<AgencyRankChangeResponse>> getDowngradeCandidates(
            @RequestBody RankEvaluateRequest request
    ) {
        return ApiResponse.<List<AgencyRankChangeResponse>>builder()
                .result(rankService.getDowngradeCandidates(request))
                .build();
    }

    @PostMapping("/agency/detail")
    public ApiResponse<AgencyRankDetailResponse> getAgencyRankDetail(
            @RequestBody AgencyRankDetailRequest request
    ) {
        return ApiResponse.<AgencyRankDetailResponse>builder()
                .result(rankService.getAgencyRankDetail(request))
                .build();
    }

    @PostMapping("/agency/change")
    public ApiResponse<String> changeRank(
            @RequestBody ChangeRankRequest request
    ) {
        return ApiResponse.<String>builder()
                .result(rankService.changeRank(request))
                .build();
    }

    @GetMapping("/history")
    public ApiResponse<List<RankHistoryResponse>> getAllRankHistories() {
        return ApiResponse.<List<RankHistoryResponse>>builder()
                .result(rankService.getAllRankHistories())
                .build();
    }

    @GetMapping("/history/agency")
    public ApiResponse<List<RankHistoryResponse>> getMyAgencyRankHistories() {
        return ApiResponse.<List<RankHistoryResponse>>builder()
                .result(rankService.getMyAgencyRankHistories())
                .build();
    }

}