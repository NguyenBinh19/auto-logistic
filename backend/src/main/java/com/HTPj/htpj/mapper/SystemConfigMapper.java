package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.systemConfig.SystemConfigResponse;
import com.HTPj.htpj.entity.SystemConfig;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SystemConfigMapper {

    SystemConfigResponse toSystemConfigResponse(SystemConfig config);

    List<SystemConfigResponse> toListSystemConfigResponse(List<SystemConfig> configs);
}