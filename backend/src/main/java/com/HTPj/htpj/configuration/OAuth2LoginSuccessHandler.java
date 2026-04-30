package com.HTPj.htpj.configuration;

import com.HTPj.htpj.dto.vault.JwtVaultProps;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.RoleRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtVaultProps jwtVaultProps;

    @Value("${jwt.valid-duration}")
    private long validDuration;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.info("=== OAuth2 SUCCESS HANDLER START ===");
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Query string: {}", request.getQueryString());
        log.info("Remote addr: {}", request.getRemoteAddr());
        log.info("Frontend URL: {}", frontendUrl);
        log.info("Authentication class: {}", authentication != null ? authentication.getClass().getName() : "null");
        log.info("Authentication name: {}", authentication != null ? authentication.getName() : "null");
        log.info("Authorities: {}", authentication != null ? authentication.getAuthorities() : "null");

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        log.info("OAuth2 attributes: {}", oAuth2User.getAttributes());

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("Google user info -> sub: {}, email: {}, name: {}", googleId, email, name);

        if (email == null || email.isBlank()) {
            log.error("OAuth2 login failed: email is null or blank");
            response.sendRedirect(frontendUrl + "/oauth-callback?error=" +
                    URLEncoder.encode("Không thể lấy email từ Google.", StandardCharsets.UTF_8));
            return;
        }

        Users user = userRepository.findByEmail(email).orElse(null);
        log.info("User found by email {}: {}", email, user != null);

        if (user == null) {
            user = Users.builder()
                    .username(generateUniqueUsername(name, email))
                    .email(email)
                    .googleId(googleId)
                    .status("ACTIVE")
                    .roles(new HashSet<>())
                    .build();

            user = userRepository.save(user);
            log.info("Created new OAuth2 user -> id: {}, username: {}, email: {}", user.getId(), user.getUsername(), user.getEmail());
        } else {
            log.info("Existing user before update -> id: {}, username: {}, status: {}, googleId: {}",
                    user.getId(), user.getUsername(), user.getStatus(), user.getGoogleId());

            if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
                user.setGoogleId(googleId);
                log.info("Linked googleId {} to existing user {}", googleId, user.getEmail());
            }

            if ("UNVERIFIED".equals(user.getStatus())) {
                user.setStatus("ACTIVE");
                log.info("Updated user status UNVERIFIED -> ACTIVE for {}", user.getEmail());
            }

            if ("BANNED".equals(user.getStatus())) {
                log.warn("Blocked OAuth2 login because user is BANNED: {}", user.getEmail());
                response.sendRedirect(frontendUrl + "/oauth-callback?error=" +
                        URLEncoder.encode("Tài khoản đã bị khóa.", StandardCharsets.UTF_8));
                return;
            }

            userRepository.save(user);
            log.info("Saved existing user after OAuth2 update: {}", user.getEmail());
        }

        user = userRepository.findByIdWithRoles(user.getId()).orElse(user);
        log.info("User after refetch -> id: {}, email: {}, roles count: {}",
                user.getId(), user.getEmail(), user.getRoles() != null ? user.getRoles().size() : 0);

        String token = generateToken(user);
        log.info("Generated JWT successfully for user: {}", user.getEmail());
        log.info("Redirecting to frontend callback: {}", frontendUrl + "/oauth-callback?token=[PROTECTED]");

        response.sendRedirect(frontendUrl + "/oauth-callback?token=" + token);
        log.info("=== OAuth2 SUCCESS HANDLER END ===");
    }

    private String generateUniqueUsername(String name, String email) {
        String base = email.split("@")[0];
        log.info("Generating username, base from email: {}", base);

        if (!userRepository.existsByUsername(base)) {
            log.info("Username available: {}", base);
            return base;
        }

        if (name != null && !name.isBlank()) {
            String normalized = name.replaceAll("\\s+", "").toLowerCase();
            log.info("Base username existed, trying normalized name: {}", normalized);
            if (!userRepository.existsByUsername(normalized)) {
                log.info("Username available: {}", normalized);
                return normalized;
            }
        }

        String finalUsername = base + "_" + UUID.randomUUID().toString().substring(0, 6);
        log.info("Generated random username fallback: {}", finalUsername);
        return finalUsername;
    }

    private String generateToken(Users user) {
        log.info("Generating token for user id: {}, email: {}", user.getId(), user.getEmail());

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        String scope = buildScope(user);
        log.info("Built scope for token: {}", scope);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("justin.nguyen")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", scope)
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("hotelId", user.getHotel() != null ? user.getHotel().getHotelId() : null)
                .claim("agencyId", user.getAgency() != null ? user.getAgency().getAgencyId() : null)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            log.info("JWT secret length: {}", jwtVaultProps.getKey() != null ? jwtVaultProps.getKey().length() : 0);
            jwsObject.sign(new MACSigner(jwtVaultProps.getKey().getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token for OAuth2 user: {}", user.getEmail(), e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(Users user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions())) {
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
                }
            });
        }
        return stringJoiner.toString();
    }
}