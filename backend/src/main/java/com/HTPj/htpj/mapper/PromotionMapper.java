package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.promotions.CreatePromotionRequest;
import com.HTPj.htpj.dto.response.promotions.ApplyPromotionResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionListResponse;
import com.HTPj.htpj.dto.response.promotions.PromotionResponse;
import com.HTPj.htpj.entity.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hotelId", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    Promotion toEntity(CreatePromotionRequest request);

    PromotionResponse toPromotionResponse(Promotion promotion);

    PromotionListResponse toPromotionListResponse(Promotion promotion);

    ApplyPromotionResponse toApplyPromotionResponse(Promotion promotion);
}