package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.response.notification.NotificationResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface NotificationService {

    void sendNotification(String userId, String category, String title, String message,
                          String targetType, String targetId, String targetUrl);

    void sendNotificationToUsers(List<String> userIds, String category, String title, String message,
                                 String targetType, String targetId, String targetUrl);

    Page<NotificationResponse> getNotifications(String userId, int page, int size,
                                                 String category, Boolean isRead);

    long getUnreadCount(String userId);

    void markAsRead(Long notificationId, String userId);

    int markAllAsRead(String userId);
}
