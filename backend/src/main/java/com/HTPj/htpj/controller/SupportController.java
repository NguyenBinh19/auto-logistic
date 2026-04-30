package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.SupportFormRequest;
import com.HTPj.htpj.entity.SystemConfig;
import com.HTPj.htpj.repository.SystemConfigRepository;
import com.HTPj.htpj.service.EmailService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupportController {

    SystemConfigRepository systemConfigRepository;
    EmailService emailServiceImpl;

    @PostMapping
    public ApiResponse<String> submitSupportForm(@Valid @RequestBody SupportFormRequest request) {
        SystemConfig config = systemConfigRepository.findByConfigCode("SUPPORT_EMAIL")
                .orElseThrow(() -> new RuntimeException("Email hỗ trợ chưa được cấu hình. Dịch vụ tạm thời không khả dụng."));

        String supportEmail = config.getConfigValue();
        if (supportEmail == null || supportEmail.isBlank()) {
            throw new RuntimeException("Email hỗ trợ chưa được cấu hình. Dịch vụ tạm thời không khả dụng.");
        }

        emailServiceImpl.sendSupportFormEmail(
                supportEmail,
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getSubject(),
                request.getMessage()
        );

        return ApiResponse.<String>builder()
                .message("Gửi yêu cầu hỗ trợ thành công")
                .result("Email đã được gửi đến bộ phận hỗ trợ")
                .build();
    }
}
