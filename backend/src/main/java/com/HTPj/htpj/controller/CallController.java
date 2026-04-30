package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.chat.CallSignalRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CallController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/call.signal")
    public void handleCallSignal(CallSignalRequest request) {


        String fromUserId = request.getFromUserId();
        String toUserId = request.getToUserId();

        request.setFromUserId(fromUserId);
        request.setToUserId(toUserId);

        messagingTemplate.convertAndSendToUser(
                toUserId,
                "/queue/call",
                request
        );
    }
}