//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.*;
//import com.HTPj.htpj.dto.response.AuthenticationResponse;
//import com.HTPj.htpj.dto.vault.JwtVaultProps;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.AuthenticationServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.util.ReflectionTestUtils;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.argThat;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class AuthenticationServiceImplTest {
//
//    @Mock
//    UserRepository userRepository;
//
//    @Mock
//    PasswordEncoder passwordEncoder;
//
//    @Mock
//    JwtVaultProps jwtVaultProps;
//
//    @Mock
//    EmailService emailService;
//
//    @InjectMocks
//    AuthenticationServiceImpl authenticationService;
//
//    private AuthenticationRequest authRequest;
//    private Users mockUser;
//    private VerifyOtpRequest request;
//    private ResendOtpRequest resendRequest;
//    private ForgotPasswordRequest forgotRequest;
//    private ResetPasswordRequest resetRequest;
//    @BeforeEach
//    void setUp() {
//        // Gán giá trị cho các trường @Value vì Mockito không tự inject values từ application.properties
//        ReflectionTestUtils.setField(authenticationService, "VALID_DURATION", 3600L);
//        ReflectionTestUtils.setField(authenticationService, "REFRESHABLE_DURATION", 7200L);
//
//        authRequest = AuthenticationRequest.builder()
//                .email("test@gmail.com")
//                .password("password123")
//                .build();
//
//        mockUser = Users.builder()
//                .id("user-uuid")
//                .email("test@gmail.com")
//                .password("encoded-password")
//                .status("ACTIVE")
//                .build();
//
//        request = VerifyOtpRequest.builder()
//                .email("test@gmail.com")
//                .otp("123456")
//                .build();
//
//        resendRequest = ResendOtpRequest.builder()
//                .email("test@gmail.com")
//                .build();
//
//        forgotRequest = new ForgotPasswordRequest();
//        forgotRequest.setEmail("test@gmail.com");
//
//        resetRequest = new ResetPasswordRequest();
//        resetRequest.setToken("some-uuid-token");
//        resetRequest.setNewPassword("NewPassword123!");
//    }
//
//    @Test
//    void authenticate_Success() {
//        // GIVEN
//        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(authRequest.getPassword(), mockUser.getPassword())).thenReturn(true);
//        // Key phải đủ 32 ký tự cho thuật toán HS256
//        when(jwtVaultProps.getKey()).thenReturn("1234567890123456789012345678901234567890123456789012345678901234");
//
//        // WHEN
//        AuthenticationResponse response = authenticationService.authenticate(authRequest);
//
//        // THEN
//        assertThat(response.isAuthenticated()).isTrue();
//        assertThat(response.getToken()).isNotNull();
//
//        // Verify lastLogin được cập nhật và lưu vào DB
//        verify(userRepository, times(1)).save(argThat(user ->
//                user.getLastLogin() != null && user.getEmail().equals("test@gmail.com")
//        ));
//    }
//
//    @Test
//    void authenticate_UserNotFound_ShouldThrowException() {
//        // GIVEN
//        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException exception = assertThrows(AppException.class, () ->
//                authenticationService.authenticate(authRequest));
//
//        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//    }
//
//    @Test
//    void authenticate_WrongPassword_ShouldThrowException() {
//        // GIVEN
//        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(authRequest.getPassword(), mockUser.getPassword())).thenReturn(false);
//
//        // WHEN & THEN
//        AppException exception = assertThrows(AppException.class, () ->
//                authenticationService.authenticate(authRequest));
//
//        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED);
//    }
//
//    @Test
//    void authenticate_AccountUnverified_ShouldThrowException() {
//        // GIVEN
//        mockUser.setStatus("UNVERIFIED");
//        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(authRequest.getPassword(), mockUser.getPassword())).thenReturn(true);
//
//        // WHEN & THEN
//        AppException exception = assertThrows(AppException.class, () ->
//                authenticationService.authenticate(authRequest));
//
//        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.ACCOUNT_NOT_VERIFIED);
//    }
//
//    @Test
//    void authenticate_AccountBanned_ShouldThrowException() {
//        // GIVEN
//        mockUser.setStatus("BANNED");
//        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(authRequest.getPassword(), mockUser.getPassword())).thenReturn(true);
//
//        // WHEN & THEN
//        AppException exception = assertThrows(AppException.class, () ->
//                authenticationService.authenticate(authRequest));
//
//        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.ACCOUNT_BANNED);
//    }
//    @Test
//    void authenticate_GenerateTokenError_ShouldThrowException() {
//        // GIVEN
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(any(), any())).thenReturn(true);
//
//        // Giả lập lỗi khi lấy key hoặc logic trong generateToken gây lỗi
//        when(jwtVaultProps.getKey()).thenThrow(new RuntimeException("Insecure key"));
//
//        // WHEN & THEN
//        assertThrows(RuntimeException.class, () -> authenticationService.authenticate(authRequest));
//    }
//    @Test
//    void authenticate_UpdateLastLoginFailed_ShouldThrowException() {
//        // GIVEN
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(any(), any())).thenReturn(true);
//
//        // Giả lập save bị lỗi
//        doThrow(new RuntimeException("Save failed")).when(userRepository).save(any());
//
//        // WHEN & THEN
//        assertThrows(RuntimeException.class, () -> authenticationService.authenticate(authRequest));
//    }
//
//    @Test
//    void verifyOtp_UserNotFound_ShouldThrowException() {
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.verifyOtp(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//    }
//
//    @Test
//    void verifyOtp_Expired_ShouldThrowException() {
//        // GIVEN: OTP hết hạn từ 10 phút trước
//        mockUser.setOtpExpiry(LocalDateTime.now().minusMinutes(10));
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.verifyOtp(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_EXPIRED);
//    }
//
//    @Test
//    void verifyOtp_Locked_ShouldThrowException() {
//        // GIVEN: Đang trong thời gian bị khóa
//        mockUser.setOtpLockedUntil(LocalDateTime.now().plusMinutes(20));
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.verifyOtp(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_MAX_ATTEMPTS);
//    }
//    @Test
//    void verifyOtp_WrongOtp_IncreaseAttempts() {
//        // GIVEN
//        mockUser.setOtp("111111");
//        mockUser.setOtpAttempts(1);
//        mockUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//
//        request.setOtp("222222"); // Sai OTP
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.verifyOtp(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_INVALID);
//
//        // Kiểm tra xem attempts có tăng lên 2 không
//        verify(userRepository).save(argThat(user -> user.getOtpAttempts() == 2));
//    }
//
//    @Test
//    void verifyOtp_WrongOtp_ReachMaxAttempts_ShouldLock() {
//        // GIVEN: Đã thử sai 4 lần, lần này là lần thứ 5 (MAX)
//        mockUser.setOtp("111111");
//        mockUser.setOtpAttempts(4);
//        mockUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//
//        request.setOtp("222222");
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.verifyOtp(request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_MAX_ATTEMPTS);
//
//        // Kiểm tra xem có set thời gian khóa và reset attempts về 0 không
//        verify(userRepository).save(argThat(user ->
//                user.getOtpLockedUntil() != null && user.getOtpAttempts() == 0));
//    }
//
//    @Test
//    void verifyOtp_Success_ShouldActivateAccount() {
//        // GIVEN
//        mockUser.setOtp("123456");
//        mockUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//        mockUser.setStatus("UNVERIFIED");
//
//        request.setOtp("123456");
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//        when(jwtVaultProps.getKey()).thenReturn("1234567890123456789012345678901234567890123456789012345678901234");
//
//        // WHEN
//        var response = authenticationService.verifyOtp(request);
//
//        // THEN
//        assertThat(response.isAuthenticated()).isTrue();
//        assertThat(response.getToken()).isNotNull();
//
//        // Kiểm tra dữ liệu được dọn dẹp sạch sẽ
//        verify(userRepository).save(argThat(user ->
//                user.getStatus().equals("ACTIVE") &&
//                        user.getOtp() == null &&
//                        user.getOtpExpiry() == null &&
//                        user.getOtpAttempts() == 0 &&
//                        user.getOtpLockedUntil() == null
//        ));
//    }
//    @Test
//    void resendOtp_UserNotFound_ShouldThrowException() {
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resendOtp(resendRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//    }
//
//    @Test
//    void resendOtp_AlreadyVerified_ShouldReturnSilently() {
//        // GIVEN: Tài khoản đã ACTIVE
//        mockUser.setStatus("ACTIVE");
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN
//        authenticationService.resendOtp(resendRequest);
//
//        // THEN: Không có lỗi ném ra và không có email nào được gửi
//        verify(emailService, never()).sendOtpEmail(any(), any(), any());
//        verify(userRepository, never()).save(any());
//    }
//
//    @Test
//    void resendOtp_Cooldown_ShouldThrowException() {
//        // GIVEN: Vừa mới gửi OTP cách đây 10 giây (Cooldown là 60s)
//        mockUser.setStatus("UNVERIFIED");
//        mockUser.setOtpLastSent(LocalDateTime.now().minusSeconds(10));
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resendOtp(resendRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_COOLDOWN);
//    }
//
//    @Test
//    void resendOtp_Locked_ShouldThrowException() {
//        // GIVEN: Đang bị khóa do thử sai quá nhiều
//        mockUser.setStatus("UNVERIFIED");
//        mockUser.setOtpLastSent(LocalDateTime.now().minusMinutes(10)); // Hết cooldown
//        mockUser.setOtpLockedUntil(LocalDateTime.now().plusMinutes(15)); // Nhưng vẫn đang bị lock
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resendOtp(resendRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.OTP_MAX_ATTEMPTS);
//    }
//    @Test
//    void resendOtp_Success() {
//        // GIVEN
//        mockUser.setStatus("UNVERIFIED");
//        mockUser.setOtpLastSent(LocalDateTime.now().minusSeconds(70)); // Đã qua cooldown
//        mockUser.setOtpLockedUntil(null);
//        mockUser.setOtpAttempts(3); // Giả sử trước đó đã thử sai 3 lần
//
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN
//        authenticationService.resendOtp(resendRequest);
//
//        // THEN
//        // 1. Kiểm tra dữ liệu lưu vào DB: reset attempts, cập nhật lastSent
//        verify(userRepository).save(argThat(user ->
//                user.getOtpAttempts() == 0 &&
//                        user.getOtp() != null &&
//                        user.getOtpLastSent() != null
//        ));
//
//        // 2. Kiểm tra email đã được gửi đi đúng địa chỉ
//        verify(emailService, times(1)).sendOtpEmail(eq(mockUser.getEmail()), anyString(), eq(mockUser.getUsername()));
//    }
//
//    @Test
//    void forgotPassword_EmailNotFound_ShouldReturnSilently() {
//        // GIVEN: Email không tồn tại trong DB
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//
//        // WHEN
//        authenticationService.forgotPassword(forgotRequest);
//
//        // THEN: Không ném lỗi, không lưu DB, không gửi email
//        verify(userRepository, never()).save(any());
//        verify(emailService, never()).sendResetPasswordEmail(any(), any(), any());
//    }
//
//    @Test
//    void forgotPassword_AccountNotActive_ShouldReturnSilently() {
//        // GIVEN: Email có tồn tại nhưng trạng thái là UNVERIFIED hoặc BANNED
//        mockUser.setStatus("UNVERIFIED");
//        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN
//        authenticationService.forgotPassword(forgotRequest);
//
//        // THEN: Không thực hiện các bước generate token hay gửi email
//        verify(userRepository, never()).save(any());
//        verify(emailService, never()).sendResetPasswordEmail(any(), any(), any());
//    }
//    @Test
//    void forgotPassword_Success() {
//        // GIVEN
//        mockUser.setStatus("ACTIVE");
//        String expectedEmail = "test@gmail.com";
//        when(userRepository.findByEmail(expectedEmail)).thenReturn(Optional.of(mockUser));
//
//        // Giả lập frontendUrl từ @Value
//        ReflectionTestUtils.setField(authenticationService, "frontendUrl", "http://localhost:5173");
//
//        // WHEN
//        authenticationService.forgotPassword(forgotRequest);
//
//        // THEN
//        // 1. Kiểm tra User được cập nhật resetToken và thời gian hết hạn
//        verify(userRepository).save(argThat(user ->
//                user.getResetToken() != null &&
//                        user.getResetTokenExpiry().isAfter(LocalDateTime.now())
//        ));
//
//        // 2. Kiểm tra email được gửi với link chứa token
//        verify(emailService).sendResetPasswordEmail(
//                eq(expectedEmail),
//                argThat(link -> link.contains("/reset-password?token=") && link.startsWith("http://localhost:5173")),
//                eq(mockUser.getUsername())
//        );
//    }
//
//    @Test
//    void resetPassword_TokenInvalid_ShouldThrowException() {
//        // GIVEN
//        when(userRepository.findByResetToken(anyString())).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resetPassword(resetRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.RESET_TOKEN_INVALID);
//    }
//
//    @Test
//    void resetPassword_TokenExpired_ShouldThrowException() {
//        // GIVEN
//        mockUser.setResetTokenExpiry(LocalDateTime.now().minusMinutes(1)); // Đã hết hạn
//        when(userRepository.findByResetToken(anyString())).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resetPassword(resetRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.RESET_TOKEN_EXPIRED);
//    }
//    @Test
//    void resetPassword_SameAsOld_ShouldThrowException() {
//        // GIVEN
//        mockUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
//        when(userRepository.findByResetToken(anyString())).thenReturn(Optional.of(mockUser));
//
//        // Giả lập mật khẩu mới trùng mật khẩu cũ
//        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> authenticationService.resetPassword(resetRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.PASSWORD_SAME_AS_OLD);
//    }
//    @Test
//    void resetPassword_Success() {
//        // GIVEN
//        mockUser.setResetToken("valid-token");
//        mockUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
//
//        resetRequest.setNewPassword("NewSecurePass123");
//
//        when(userRepository.findByResetToken(anyString())).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
//        when(passwordEncoder.encode(anyString())).thenReturn("new-encoded-password");
//
//        // WHEN
//        authenticationService.resetPassword(resetRequest);
//
//        // THEN
//        // 1. Kiểm tra mật khẩu đã được cập nhật và Token đã bị xóa
//        verify(userRepository).save(argThat(user ->
//                user.getPassword().equals("new-encoded-password") &&
//                        user.getResetToken() == null &&
//                        user.getResetTokenExpiry() == null
//        ));
//
//        // 2. Kiểm tra có gửi email thông báo đổi mật khẩu thành công
//        verify(emailService).sendPasswordChangedNotification(eq(mockUser.getEmail()), eq(mockUser.getUsername()));
//    }
//}