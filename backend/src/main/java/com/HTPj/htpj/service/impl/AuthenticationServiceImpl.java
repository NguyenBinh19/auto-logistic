package com.HTPj.htpj.service.impl;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import com.HTPj.htpj.dto.request.*;
import com.HTPj.htpj.dto.response.AuthenticationResponse;
import com.HTPj.htpj.dto.response.IntrospectResponse;
import com.HTPj.htpj.dto.vault.JwtVaultProps;
import com.HTPj.htpj.entity.InvalidatedToken;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.InvalidatedTokenRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.AuthenticationService;
import com.HTPj.htpj.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    JwtVaultProps jwtVaultProps;
    PasswordEncoder passwordEncoder;
    EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_MAX_ATTEMPTS = 5;
    private static final int OTP_LOCK_MINUTES = 30;
    private static final int OTP_COOLDOWN_SECONDS = 60;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 15;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    @NonFinal
    @Value("${app.frontend-url:http://localhost:5173}")
    protected String frontendUrl;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var users = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), users.getPassword());

        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Check account status
        if ("UNVERIFIED".equals(users.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_VERIFIED);
        }
        if ("BANNED".equals(users.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }
        if ("LOCKED".equals(users.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }

        // Update last login timestamp
        users.setLastLogin(LocalDateTime.now());
        userRepository.save(users);

        var token = generateToken(users);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    @Override
    public AuthenticationResponse verifyOtp(VerifyOtpRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check if OTP is locked
        if (user.getOtpLockedUntil() != null && LocalDateTime.now().isBefore(user.getOtpLockedUntil())) {
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        // Check OTP expiry
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        // Check OTP value
        if (!request.getOtp().equals(user.getOtp())) {
            user.setOtpAttempts(user.getOtpAttempts() + 1);
            if (user.getOtpAttempts() >= OTP_MAX_ATTEMPTS) {
                user.setOtpLockedUntil(LocalDateTime.now().plusMinutes(OTP_LOCK_MINUTES));
                user.setOtpAttempts(0);
                userRepository.save(user);
                throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
            }
            userRepository.save(user);
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // OTP is valid - activate account
        user.setStatus("ACTIVE");
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
        user.setOtpLockedUntil(null);
        userRepository.save(user);

        // Generate token and log user in
        var token = generateToken(user);
        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!"UNVERIFIED".equals(user.getStatus())) {
            return; // Account already verified, silently return
        }

        // Check cooldown
        if (user.getOtpLastSent() != null
                && LocalDateTime.now().isBefore(user.getOtpLastSent().plusSeconds(OTP_COOLDOWN_SECONDS))) {
            throw new AppException(ErrorCode.OTP_COOLDOWN);
        }

        // Check if locked
        if (user.getOtpLockedUntil() != null && LocalDateTime.now().isBefore(user.getOtpLockedUntil())) {
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS);
        }

        // Generate new OTP
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        user.setOtpAttempts(0);
        user.setOtpLastSent(LocalDateTime.now());
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp, user.getUsername());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        var userOpt = userRepository.findByEmail(request.getEmail());

        // Always return success to prevent email enumeration
        if (userOpt.isEmpty()) {
            return;
        }

        Users user = userOpt.get();

        // Only allow for active accounts
        if (!"ACTIVE".equals(user.getStatus())) {
            return;
        }

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        emailService.sendResetPasswordEmail(user.getEmail(), resetLink, user.getUsername());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        Users user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.RESET_TOKEN_INVALID));

        // Check token expiry
        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            throw new AppException(ErrorCode.RESET_TOKEN_EXPIRED);
        }

        // Check new password differs from old
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // Send notification
        emailService.sendPasswordChangedNotification(user.getEmail(), user.getUsername());
    }

    private String generateToken(Users user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("justin.nguyen")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("agencyId", user.getAgency() != null ? user.getAgency().getAgencyId() : null)
                .claim("hotelId", user.getHotel() != null ? user.getHotel().getHotelId() : null)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(jwtVaultProps.getKey().getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(jwtVaultProps.getKey().getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                        .getJWTClaimsSet()
                        .getIssueTime()
                        .toInstant()
                        .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(Users user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}