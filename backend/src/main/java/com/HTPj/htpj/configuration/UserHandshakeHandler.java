package com.HTPj.htpj.configuration;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        String query = request.getURI().getQuery();

        String userId;

        if (query != null && query.contains("userId=")) {
            userId = query.split("userId=")[1];
        } else {
            userId = "anonymous";
        }

        return () -> userId;
    }
}