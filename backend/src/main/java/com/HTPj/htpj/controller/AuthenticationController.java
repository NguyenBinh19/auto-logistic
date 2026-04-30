package com.HTPj.htpj.controller;

import java.text.ParseException;

import com.HTPj.htpj.dto.request.*;
import com.HTPj.htpj.dto.response.AuthenticationResponse;
import com.HTPj.htpj.dto.response.IntrospectResponse;
import com.HTPj.htpj.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationServiceImpl;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationServiceImpl.authenticate(request))
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationServiceImpl.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationServiceImpl.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationServiceImpl.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/verify-otp")
    ApiResponse<AuthenticationResponse> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        var result = authenticationServiceImpl.verifyOtp(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .message("Email xác thực thành công!")
                .result(result)
                .build();
    }

    @PostMapping("/resend-otp")
    ApiResponse<Void> resendOtp(@RequestBody @Valid ResendOtpRequest request) {
        authenticationServiceImpl.resendOtp(request);
        return ApiResponse.<Void>builder()
                .message("Mã OTP mới đã được gửi đến email của bạn.")
                .build();
    }

    @PostMapping("/forgot-password")
    ApiResponse<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authenticationServiceImpl.forgotPassword(request);
        return ApiResponse.<Void>builder()
                .message("Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.")
                .build();
    }

    @PostMapping("/reset-password")
    ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationServiceImpl.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message("Mật khẩu đã được cập nhật thành công.")
                .build();
    }
}