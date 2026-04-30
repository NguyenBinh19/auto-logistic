package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.systemConfig.UpdateSystemConfigRequest;
import com.HTPj.htpj.dto.response.systemConfig.SystemConfigResponse;

import java.util.List;

public interface SystemConfigService {

    List<SystemConfigResponse> getAllConfigs();

    SystemConfigResponse updateConfig(UpdateSystemConfigRequest request);
}