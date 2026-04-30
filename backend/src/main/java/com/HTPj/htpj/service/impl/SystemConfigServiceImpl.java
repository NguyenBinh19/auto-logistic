package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.systemConfig.UpdateSystemConfigRequest;
import com.HTPj.htpj.dto.response.systemConfig.SystemConfigResponse;
import com.HTPj.htpj.entity.SystemConfig;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.SystemConfigMapper;
import com.HTPj.htpj.repository.SystemConfigRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.SystemConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemConfigServiceImpl implements SystemConfigService {

    SystemConfigRepository systemConfigRepository;
    SystemConfigMapper systemConfigMapper;
    UserRepository userRepository;
    NotificationService notificationService;

    private String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }

    @Override
    public List<SystemConfigResponse> getAllConfigs() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        return systemConfigMapper.toListSystemConfigResponse(configs);
    }

    @Override
    public SystemConfigResponse updateConfig(UpdateSystemConfigRequest request) {

        SystemConfig config = systemConfigRepository.findById(request.getConfigId())
                .orElseThrow(() -> new AppException(ErrorCode.CONFIG_NOT_FOUND));

        config.setConfigValue(request.getConfigValue());

        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(getUserId());

        systemConfigRepository.save(config);

        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(admin.getId(), "SYSTEM",
                    "Cấu hình hệ thống đã được cập nhật",
                    "Cấu hình \"" + config.getConfigCode() + "\" đã được cập nhật.",
                    "CONFIG", String.valueOf(config.getConfigId()), "/admin/system-config");
        }
        return systemConfigMapper.toSystemConfigResponse(config);
    }


}