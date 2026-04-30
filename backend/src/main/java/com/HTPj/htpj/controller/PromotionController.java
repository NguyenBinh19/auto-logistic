package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.promotions.ApplyPromotionRequest;
import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.request.promotions.UpdatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionListResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.service.PromotionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    ApiResponse<PromotionResponse> createPromotion(
            @RequestBody CreatePromotionRequest request
    ) {
        return ApiResponse.<PromotionResponse>builder()
                .result(promotionService.createPromotion(request))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<PromotionResponse> updatePromotion(
            @PathVariable Integer id,
            @RequestBody UpdatePromotionRequest request
    ) {
        return ApiResponse.<PromotionResponse>builder()
                .result(promotionService.updatePromotion(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    ApiResponse<String> deletePromotion(
            @PathVariable Integer id
    ) {
        promotionService.deletePromotion(id);
        return ApiResponse.<String>builder()
                .result("Promotion deleted successfully")
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<PromotionResponse> getPromotionDetail(
            @PathVariable Integer id
    ) {
        return ApiResponse.<PromotionResponse>builder()
                .result(promotionService.getPromotionDetail(id))
                .build();
    }

    @GetMapping("/listOfHotel")
    ApiResponse<List<PromotionListResponse>> getPromotionsByHotel() {
        return ApiResponse.<List<PromotionListResponse>>builder()
                .result(promotionService.getPromotionsByHotel())
                .build();
    }

    @PostMapping("/apply/available")
    ApiResponse<List<ApplyPromotionResponse>> getAvailablePromotions(
            @RequestBody ApplyPromotionRequest request
    ) {

        return ApiResponse.<List<ApplyPromotionResponse>>builder()
                .result(promotionService.getAvailablePromotions(request))
                .build();
    }

    @PostMapping("/apply/check")
    ApiResponse<ApplyPromotionResponse> checkPromotionCode(
            @RequestBody CheckPromotionCodeRequest request
    ) {

        return ApiResponse.<ApplyPromotionResponse>builder()
                .result(promotionService.checkPromotionCode(request))
                .build();
    }
}