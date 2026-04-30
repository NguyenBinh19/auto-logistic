package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.promotions.ApplyPromotionRequest;
import com.HTPj.htpj.dto.request.promotions.CheckPromotionCodeRequest;
import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.request.promotions.UpdatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionListResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;

import java.util.List;

public interface PromotionService {
    PromotionResponse createPromotion(CreatePromotionRequest request);
    PromotionResponse updatePromotion(Integer id, UpdatePromotionRequest request);
    void deletePromotion(Integer id);
    PromotionResponse getPromotionDetail(Integer id);
    List<PromotionListResponse> getPromotionsByHotel();
    List<ApplyPromotionResponse> getAvailablePromotions(ApplyPromotionRequest request);
    ApplyPromotionResponse checkPromotionCode(CheckPromotionCodeRequest request);

}
