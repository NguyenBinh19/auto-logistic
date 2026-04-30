package com.HTPj.htpj.dto.response.notification;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String category;
    private String title;
    private String message;
    private String targetType;
    private String targetId;
    private String targetUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
