//package com.HTPj.htpj.service;
//import com.HTPj.htpj.dto.response.notification.NotificationResponse;
//import com.HTPj.htpj.entity.Notification;
//import com.HTPj.htpj.repository.NotificationRepository;
//import com.HTPj.htpj.service.impl.NotificationServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.Assert.assertThrows;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class NotificationServiceImplTest {
//
//    @Mock
//    private NotificationRepository notificationRepository;
//
//    @Mock
//    private SimpMessagingTemplate messagingTemplate;
//
//    @InjectMocks
//    private NotificationServiceImpl notificationService;
//
//
//    @Test
//    void sendNotification_Success() {
//        String userId = "user-123";
//        String title = "New Booking";
//        Notification notification = Notification.builder().id(1L).userId(userId).title(title).build();
//
//        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
//
//        notificationService.sendNotification(userId, "BOOKING", title, "You have a new booking",
//                "BOOKING", "BK001", "/url");
//
//        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
//        verify(notificationRepository).save(notificationCaptor.capture());
//
//        Notification savedNotification = notificationCaptor.getValue();
//        assertThat(savedNotification.getUserId()).isEqualTo(userId);
//        assertThat(savedNotification.getIsRead()).isFalse(); // Mặc định phải là chưa đọc
//        assertThat(savedNotification.getCreatedAt()).isNotNull();
//
//        verify(messagingTemplate).convertAndSendToUser(
//                eq(userId),
//                eq("/queue/notifications"),
//                any(NotificationResponse.class)
//        );
//    }
//
//    @Test
//    void sendNotification_Fail_DatabaseError() {
//        when(notificationRepository.save(any())).thenThrow(new RuntimeException("Connection Lost"));
//
//        notificationService.sendNotification("u1", "C", "T", "M", "T", "I", "U");
//
//        verify(messagingTemplate, never()).convertAndSendToUser(anyString(), anyString(), any());
//    }
//    @Test
//    void sendNotification_Fail_WebSocketError() {
//        Notification n = Notification.builder().id(1L).userId("u1").build();
//        when(notificationRepository.save(any())).thenReturn(n);
//
//        doThrow(new RuntimeException("WS Down"))
//                .when(messagingTemplate).convertAndSendToUser(anyString(), anyString(), any());
//
//        notificationService.sendNotification("u1", "C", "T", "M", "T", "I", "U");
//
//        verify(notificationRepository).save(any());
//    }
//    @Test
//    void getNotifications_FilterByReadStatus_Success() {
//        String userId = "user1";
//        Pageable pageable = PageRequest.of(0, 10);
//        Notification notification = Notification.builder().id(1L).userId(userId).isRead(true).build();
//        Page<Notification> page = new PageImpl<>(List.of(notification));
//
//        when(notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(eq(userId), eq(true), any(Pageable.class)))
//                .thenReturn(page);
//
//        Page<NotificationResponse> result = notificationService.getNotifications(userId, 0, 10, null, true);
//
//        assertThat(result.getContent()).hasSize(1);
//        assertThat(result.getContent().get(0).getIsRead()).isTrue();
//        verify(notificationRepository).findByUserIdAndIsReadOrderByCreatedAtDesc(eq(userId), eq(true), any(Pageable.class));
//    }
//
//    @Test
//    void getNotifications_FilterByCategory_Success() {
//        String userId = "user1";
//        String category = "BOOKING";
//        Page<Notification> page = new PageImpl<>(List.of(Notification.builder().category(category).build()));
//
//        when(notificationRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(eq(userId), eq(category), any(Pageable.class)))
//                .thenReturn(page);
//
//        notificationService.getNotifications(userId, 0, 10, category, null);
//
//        verify(notificationRepository).findByUserIdAndCategoryOrderByCreatedAtDesc(eq(userId), eq(category), any(Pageable.class));
//    }
//
//    @Test
//    void getNotifications_Default_Success() {
//        String userId = "user1";
//        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(eq(userId), any(Pageable.class)))
//                .thenReturn(new PageImpl<>(List.of()));
//
//        notificationService.getNotifications(userId, 0, 10, null, null);
//
//        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(eq(userId), any(Pageable.class));
//    }
//
//    @Test
//    void getUnreadCount_Success() {
//        String userId = "user1";
//        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(5L);
//
//        long count = notificationService.getUnreadCount(userId);
//
//        assertThat(count).isEqualTo(5L);
//        verify(notificationRepository).countByUserIdAndIsReadFalse(userId);
//    }
//
//    @Test
//    void markAsRead_Success() {
//        Long notifyId = 1L;
//        String userId = "user1";
//        Notification notification = Notification.builder()
//                .id(notifyId)
//                .userId(userId)
//                .isRead(false)
//                .build();
//
//        when(notificationRepository.findById(notifyId)).thenReturn(Optional.of(notification));
//
//        // WHEN
//        notificationService.markAsRead(notifyId, userId);
//
//        // THEN
//        assertThat(notification.getIsRead()).isTrue();
//        assertThat(notification.getReadAt()).isNotNull();
//        verify(notificationRepository).save(notification);
//    }
//
//    @Test
//    void markAsRead_Fail_NotFound() {
//        when(notificationRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        assertThrows(RuntimeException.class, () -> {
//            notificationService.markAsRead(999L, "user1");
//        });
//    }
//
//    @Test
//    void markAsRead_Fail_AccessDenied() {
//        Long notifyId = 1L;
//        Notification notification = Notification.builder()
//                .id(notifyId)
//                .userId("owner-id")
//                .build();
//
//        when(notificationRepository.findById(notifyId)).thenReturn(Optional.of(notification));
//
//        assertThrows(RuntimeException.class, () -> {
//            notificationService.markAsRead(notifyId, "stranger-id");
//        });
//        verify(notificationRepository, never()).save(any());
//    }
//
//
//    @Test
//    void markAllAsRead_Success() {
//        String userId = "user1";
//        when(notificationRepository.markAllAsReadByUserId(userId)).thenReturn(10);
//
//        int result = notificationService.markAllAsRead(userId);
//
//        assertThat(result).isEqualTo(10);
//        verify(notificationRepository).markAllAsReadByUserId(userId);
//    }
//    @Test
//    void markAllAsRead_NoNotifications_ShouldReturnZero() {
//        String userId = "no-notif-user";
//        when(notificationRepository.markAllAsReadByUserId(userId)).thenReturn(0);
//
//        int result = notificationService.markAllAsRead(userId);
//
//        assertThat(result).isZero();
//        verify(notificationRepository).markAllAsReadByUserId(userId);
//    }
//    @Test
//    void markAsRead_AlreadyRead_ShouldNotUpdateAgain() {
//        Long notifyId = 10L;
//        String userId = "user-123";
//        LocalDateTime originalReadAt = LocalDateTime.now().minusDays(1);
//
//        Notification notification = Notification.builder()
//                .id(notifyId)
//                .userId(userId)
//                .isRead(true) // Đã đọc
//                .readAt(originalReadAt)
//                .build();
//
//        when(notificationRepository.findById(notifyId)).thenReturn(Optional.of(notification));
//
//        notificationService.markAsRead(notifyId, userId);
//
//        assertThat(notification.getIsRead()).isTrue();
//        assertThat(notification.getReadAt()).isEqualTo(originalReadAt);
//
//        verify(notificationRepository, never()).save(any(Notification.class));
//    }
//    @Test
//    void getNotifications_ShouldPrioritizeIsRead() {
//        String userId = "user1";
//        Page<Notification> emptyPage = new PageImpl<>(List.of());
//
//        when(notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(eq(userId), eq(true), any()))
//                .thenReturn(emptyPage);
//
//
//        notificationService.getNotifications(userId, 0, 10, "PROMOTION", true);
//
//        verify(notificationRepository).findByUserIdAndIsReadOrderByCreatedAtDesc(eq(userId), eq(true), any());
//        verify(notificationRepository, never()).findByUserIdAndCategoryOrderByCreatedAtDesc(any(), any(), any());
//    }
//
//
//}
