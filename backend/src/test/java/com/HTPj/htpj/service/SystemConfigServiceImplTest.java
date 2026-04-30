//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.systemConfig.UpdateSystemConfigRequest;
//import com.HTPj.htpj.dto.response.systemConfig.SystemConfigResponse;
//import com.HTPj.htpj.entity.SystemConfig;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.SystemConfigMapper;
//import com.HTPj.htpj.repository.SystemConfigRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.SystemConfigServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class SystemConfigServiceImplTest {
//
//    @Mock
//    private SystemConfigRepository systemConfigRepository;
//
//    @Mock
//    private SystemConfigMapper systemConfigMapper;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @Mock
//    private SecurityContext securityContext;
//
//    @Mock
//    private Authentication authentication;
//
//    @Mock
//    private Jwt jwt;
//
//    @InjectMocks
//    private SystemConfigServiceImpl systemConfigService;
//
//    private final String USER_ID = "user-123";
//
//    @BeforeEach
//    void setUp() {
//        // Mock SecurityContext để hàm getUserId() chạy được
//        SecurityContextHolder.setContext(securityContext);
//    }
//
//    @AfterEach
//    void tearDown() {
//        SecurityContextHolder.clearContext();
//    }
//
//    @Test
//    void updateConfig_Success() {
//        // 1. GIVEN (Chuẩn bị dữ liệu)
//        UpdateSystemConfigRequest request = UpdateSystemConfigRequest.builder()
//                .configId(1)
//                .configValue("NEW_VALUE")
//                .build();
//
//        SystemConfig existingConfig = SystemConfig.builder()
//                .configId(1)
//                .configCode("SITE_NAME")
//                .configValue("OLD_VALUE")
//                .build();
//
//        Users admin1 = Users.builder().id("admin-1").build();
//        Users admin2 = Users.builder().id("admin-2").build();
//
//        // Mock Security
//        when(securityContext.getAuthentication()).thenReturn(authentication);
//        when(authentication.getPrincipal()).thenReturn(jwt);
//        when(jwt.getClaim("userId")).thenReturn(USER_ID);
//
//        // Mock Repository & Mapper
//        when(systemConfigRepository.findById(1)).thenReturn(Optional.of(existingConfig));
//        when(userRepository.findByIsAdminTrue()).thenReturn(List.of(admin1, admin2));
//        when(systemConfigMapper.toSystemConfigResponse(any(SystemConfig.class)))
//                .thenReturn(SystemConfigResponse.builder().configValue("NEW_VALUE").build());
//
//        // 2. WHEN (Thực thi)
//        SystemConfigResponse response = systemConfigService.updateConfig(request);
//
//        // 3. THEN (Kiểm tra kết quả)
//        assertThat(response.getConfigValue()).isEqualTo("NEW_VALUE");
//        assertThat(existingConfig.getConfigValue()).isEqualTo("NEW_VALUE");
//        assertThat(existingConfig.getUpdatedBy()).isEqualTo(USER_ID);
//
//        // Kiểm tra xem có lưu vào DB không
//        verify(systemConfigRepository, times(1)).save(existingConfig);
//
//        // Kiểm tra xem có gửi thông báo cho 2 admin không
//        verify(notificationService, times(1)).sendNotification(
//                eq("admin-1"), eq("SYSTEM"), anyString(), anyString(), eq("CONFIG"), anyString(), anyString());
//        verify(notificationService, times(1)).sendNotification(
//                eq("admin-2"), eq("SYSTEM"), anyString(), anyString(), eq("CONFIG"), anyString(), anyString());
//    }
//
//    @Test
//    void updateConfig_NotFound_ThrowsException() {
//        // 1. GIVEN
//        UpdateSystemConfigRequest request = UpdateSystemConfigRequest.builder()
//                .configId(999) // ID không tồn tại
//                .configValue("VALUE")
//                .build();
//
//        when(systemConfigRepository.findById(999)).thenReturn(Optional.empty());
//
//        // 2. WHEN & THEN
//        assertThatThrownBy(() -> systemConfigService.updateConfig(request))
//                .isInstanceOf(AppException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CONFIG_NOT_FOUND);
//
//        // Đảm bảo không có hàm lưu hay gửi thông báo nào được gọi sau đó
//        verify(systemConfigRepository, never()).save(any());
//        verify(notificationService, never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    @Test
//    void updateConfig_Success_NoAdminsInSystem() {
//        // GIVEN
//        UpdateSystemConfigRequest request = UpdateSystemConfigRequest.builder()
//                .configId(1)
//                .configValue("VALUE")
//                .build();
//
//        SystemConfig existingConfig = SystemConfig.builder()
//                .configId(1)
//                .configCode("SITE_NAME")
//                .build();
//
//        when(securityContext.getAuthentication()).thenReturn(authentication);
//        when(authentication.getPrincipal()).thenReturn(jwt);
//        when(jwt.getClaim("userId")).thenReturn(USER_ID);
//
//        when(systemConfigRepository.findById(1)).thenReturn(Optional.of(existingConfig));
//        when(userRepository.findByIsAdminTrue()).thenReturn(java.util.Collections.emptyList());
//        when(systemConfigMapper.toSystemConfigResponse(any())).thenReturn(new SystemConfigResponse());
//
//        // WHEN
//        systemConfigService.updateConfig(request);
//
//        // THEN
//        verify(systemConfigRepository, times(1)).save(any());
//        verify(notificationService, never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//}