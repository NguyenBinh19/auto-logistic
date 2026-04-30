package com.HTPj.htpj.configuration;

import com.HTPj.htpj.interceptors.UserHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue", "/topic");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new UserHandshakeInterceptor()) // 👈 thêm dòng này
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(
                            ServerHttpRequest request,
                            WebSocketHandler wsHandler,
                            Map<String, Object> attributes
                    ) {

                        String userId = (String) attributes.get("userId");

                        if (userId == null) {
                            String query = request.getURI().getQuery();

                            if (query != null && query.contains("=")) {
                                String[] parts = query.split("=");
                                if (parts.length > 1) {
                                    userId = parts[1];
                                } else {
                                    userId = "anonymous";
                                }
                            } else {
                                userId = "anonymous";
                            }
                        }

                        String finalUserId = userId;
                        return () -> finalUserId;
                    }
                })
                .withSockJS();
    }
}