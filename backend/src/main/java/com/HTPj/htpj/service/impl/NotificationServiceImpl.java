package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.response.notification.NotificationResponse;
import com.HTPj.htpj.entity.Notification;
import com.HTPj.htpj.repository.NotificationRepository;
import com.HTPj.htpj.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Async
    public void sendNotification(String userId, String category, String title, String message,
                                  String targetType, String targetId, String targetUrl) {
        try {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .category(category)
                    .title(title)
                    .message(message)
                    .targetType(targetType)
                    .targetId(targetId)
                    .targetUrl(targetUrl)
                    .isRead(false)
                    .createdAt(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                    .build();

            notification = notificationRepository.save(notification);

            NotificationResponse response = toResponse(notification);
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", response);

            log.info("Notification sent to user {}: {}", userId, title);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendNotificationToUsers(List<String> userIds, String category, String title, String message,
                                         String targetType, String targetId, String targetUrl) {
        for (String userId : userIds) {
            sendNotification(userId, category, title, message, targetType, targetId, targetUrl);
        }
    }

    @Override
    public Page<NotificationResponse> getNotifications(String userId, int page, int size,
                                                         String category, Boolean isRead) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Notification> notifications;
        if (isRead != null) {
            notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, isRead, pageable);
        } else if (category != null && !category.isEmpty()) {
            notifications = notificationRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category, pageable);
        } else {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return notifications.map(this::toResponse);
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .category(notification.getCategory())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetType(notification.getTargetType())
                .targetId(notification.getTargetId())
                .targetUrl(notification.getTargetUrl())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
