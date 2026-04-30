package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.commision.CommissionLogResponse;
import com.HTPj.htpj.entity.CommissionLog;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommissionLogMapper {

    CommissionLogResponse toResponse(CommissionLog entity);

    List<CommissionLogResponse> toResponseList(List<CommissionLog> entities);
}