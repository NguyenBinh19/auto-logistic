package com.HTPj.htpj.configuration;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("=== OAuth2 LOGIN FAILURE ===");
        log.error("Request URI: {}", request.getRequestURI());
        log.error("Request URL: {}", request.getRequestURL());
        log.error("Query string: {}", request.getQueryString());
        log.error("Exception type: {}", exception.getClass().getName());
        log.error("Exception message: {}", exception.getMessage(), exception);

        String errorMessage = exception.getMessage() != null
                ? exception.getMessage()
                : "OAuth2 login failed";

        response.sendRedirect(frontendUrl + "/oauth-callback?error=" +
                URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
    }
}