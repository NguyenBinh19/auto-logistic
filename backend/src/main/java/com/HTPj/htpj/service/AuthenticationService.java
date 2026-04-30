package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.*;
import com.HTPj.htpj.dto.response.AuthenticationResponse;
import com.HTPj.htpj.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {

    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;

    AuthenticationResponse authenticate(AuthenticationRequest request);

    void logout(LogoutRequest request) throws ParseException, JOSEException;

    AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;

    AuthenticationResponse verifyOtp(VerifyOtpRequest request);

    void resendOtp(ResendOtpRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
