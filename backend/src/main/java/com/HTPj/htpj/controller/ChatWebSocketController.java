package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.chat.ChatMessageRequest;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request) {

        Message saved = chatService.save(request);

        ChatMessageResponse msg = ChatMessageResponse.builder()
                .senderId(saved.getSender().getId())
                .receiverId(saved.getReceiver().getId())
                .content(saved.getContent())
                .type(saved.getType())
                .fileUrl(saved.getFileUrl())
                .fileName(saved.getFileName())
                .createdAt(saved.getCreatedAt())
                .build();

        messagingTemplate.convertAndSendToUser(
                saved.getReceiver().getId(),
                "/queue/messages",
                msg
        );

        messagingTemplate.convertAndSendToUser(
                saved.getSender().getId(),
                "/queue/messages",
                msg
        );
    }
}