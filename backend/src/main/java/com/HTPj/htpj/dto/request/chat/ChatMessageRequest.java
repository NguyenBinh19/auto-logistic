package com.HTPj.htpj.dto.request.chat;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String conversationId;
    private String senderId;
    private String content;
    private String booking;
    private String type; // TEXT | IMAGE | FILE
    private String fileUrl;
    private String fileName;
}