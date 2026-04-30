package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.rank.RankPeriodItemResponse;
import com.HTPj.htpj.entity.SystemConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RankPeriodMapper {

    @Mapping(target = "type", source = "configCode")
    @Mapping(target = "value", source = "configValue")
    RankPeriodItemResponse toResponse(SystemConfig config);

    List<RankPeriodItemResponse> toResponseList(List<SystemConfig> configs);
}