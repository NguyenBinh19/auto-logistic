package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.response.notification.NotificationResponse;
import com.HTPj.htpj.dto.response.notification.UnreadCountResponse;
import com.HTPj.htpj.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isRead) {

        String userId = jwt.getClaim("userId");
        Page<NotificationResponse> notifications = notificationService.getNotifications(userId, page, size, category, isRead);

        return ApiResponse.<Page<NotificationResponse>>builder()
                .result(notifications)
                .build();
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("userId");
        long count = notificationService.getUnreadCount(userId);

        return ApiResponse.<UnreadCountResponse>builder()
                .result(UnreadCountResponse.builder().unreadCount(count).build())
                .build();
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("userId");
        notificationService.markAsRead(id, userId);

        return ApiResponse.<Void>builder()
                .message("Notification marked as read")
                .build();
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("userId");
        notificationService.markAllAsRead(userId);

        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }
}
