package com.HTPj.htpj.dto.response.chat;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String senderId;
    String receiverId;
    String content;
    LocalDateTime createdAt;
    String type;
    String fileUrl;
    String fileName;
}