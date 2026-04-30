package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.rank.CreateRankRequest;
import com.HTPj.htpj.dto.response.rank.RankResponse;
import com.HTPj.htpj.entity.Rank;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RankMapper {

    Rank toRank(CreateRankRequest request);

    @Mapping(target = "agencies", ignore = true)
    RankResponse toResponse(Rank rank);
}
