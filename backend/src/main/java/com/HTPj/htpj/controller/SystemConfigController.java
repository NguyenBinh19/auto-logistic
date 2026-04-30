package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.systemConfig.UpdateSystemConfigRequest;
import com.HTPj.htpj.dto.response.systemConfig.SystemConfigResponse;
import com.HTPj.htpj.entity.SystemConfig;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.SystemConfigRepository;
import com.HTPj.htpj.service.SystemConfigService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/system-config")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemConfigController {

    SystemConfigRepository systemConfigRepository;
    SystemConfigService systemConfigService;

    @GetMapping
    ApiResponse<List<SystemConfigResponse>> getAllConfigs() {
        return ApiResponse.<List<SystemConfigResponse>>builder()
                .result(systemConfigService.getAllConfigs())
                .build();
    }

    @PutMapping
    ApiResponse<SystemConfigResponse> updateConfig(@RequestBody @Valid UpdateSystemConfigRequest request) {
        return ApiResponse.<SystemConfigResponse>builder()
                .result(systemConfigService.updateConfig(request))
                .build();
    }

    /**
     * Get cancellation penalty configs
     * Returns: CANCEL_DAYS_BEFORE_CHECKIN and CANCEL_PENALTY_PERCENT
     */
    @GetMapping("/cancel-policy")
    public ApiResponse<Map<String, String>> getCancelPolicyConfig() {

        List<SystemConfig> configs = systemConfigRepository.findByConfigCodeIn(
                List.of(
                        "CANCEL_FULL_REFUND_DAYS",
                        "CANCEL_PENALTY_DAYS",
                        "CANCEL_LEVEL1_PERCENT",
                        "CANCEL_LEVEL2_PERCENT",
                        "CANCEL_LEVEL3_PERCENT"
                )
        );

        Map<String, String> result = configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigCode, SystemConfig::getConfigValue));

        return ApiResponse.<Map<String, String>>builder()
                .result(result)
                .build();
    }
    /**
     * Update cancellation penalty configs
     * Body: { "daysBeforeCheckin": "3", "penaltyPercent": "30" }
     */
    @PutMapping("/cancel-penalty")
    public ApiResponse<String> updateCancelPenaltyConfig(@RequestBody Map<String, String> request) {

        String currentUserId = getCurrentUserId();

        String fullRefundDaysVal = request.get("fullRefundDays");
        String penaltyDaysVal = request.get("penaltyDays");

        String level1PercentVal = request.get("level1Percent");
        String level2PercentVal = request.get("level2Percent");
        String level3PercentVal = request.get("level3Percent");

        // ===== FULL REFUND DAYS (>= X ngày) =====
        if (fullRefundDaysVal != null) {
            int days = Integer.parseInt(fullRefundDaysVal);
            if (days < 0) throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_FULL_REFUND_DAYS")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_FULL_REFUND_DAYS")
                            .configName("Full Refund Days Before Checkin")
                            .dataType("INTEGER")
                            .description("Days before check-in for lowest penalty level")
                            .isActive(true)
                            .build());

            config.setConfigValue(String.valueOf(days));
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        // ===== PENALTY DAYS (mốc giữa) =====
        if (penaltyDaysVal != null) {
            int days = Integer.parseInt(penaltyDaysVal);
            if (days < 0) throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_PENALTY_DAYS")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_PENALTY_DAYS")
                            .configName("Penalty Days Before Checkin")
                            .dataType("INTEGER")
                            .description("Days threshold for mid-level penalty")
                            .isActive(true)
                            .build());

            config.setConfigValue(String.valueOf(days));
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        // ===== LEVEL 1 (>= fullRefundDays) =====
        if (level1PercentVal != null) {
            double percent = Double.parseDouble(level1PercentVal);
            if (percent < 0 || percent > 100)
                throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_LEVEL1_PERCENT")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_LEVEL1_PERCENT")
                            .configName("Cancel Level 1 Percent")
                            .dataType("DECIMAL")
                            .description("Penalty percent when cancelling early")
                            .isActive(true)
                            .build());

            config.setConfigValue(level1PercentVal);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        // ===== LEVEL 2 (giữa) =====
        if (level2PercentVal != null) {
            double percent = Double.parseDouble(level2PercentVal);
            if (percent < 0 || percent > 100)
                throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_LEVEL2_PERCENT")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_LEVEL2_PERCENT")
                            .configName("Cancel Level 2 Percent")
                            .dataType("DECIMAL")
                            .description("Penalty percent for mid-range cancellation")
                            .isActive(true)
                            .build());

            config.setConfigValue(level2PercentVal);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        // ===== LEVEL 3 (< penaltyDays) =====
        if (level3PercentVal != null) {
            double percent = Double.parseDouble(level3PercentVal);
            if (percent < 0 || percent > 100)
                throw new AppException(ErrorCode.INVALID_CONFIG_VALUE);

            SystemConfig config = systemConfigRepository.findByConfigCode("CANCEL_LEVEL3_PERCENT")
                    .orElseGet(() -> SystemConfig.builder()
                            .configCode("CANCEL_LEVEL3_PERCENT")
                            .configName("Cancel Level 3 Percent")
                            .dataType("DECIMAL")
                            .description("Penalty percent for last-minute cancellation")
                            .isActive(true)
                            .build());

            config.setConfigValue(level3PercentVal);
            config.setUpdatedAt(LocalDateTime.now());
            config.setUpdatedBy(currentUserId);
            systemConfigRepository.save(config);
        }

        return ApiResponse.<String>builder()
                .result("Cancel policy config updated successfully")
                .build();
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("userId");
        }
        return null;
    }
}
