package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_user_read", columnList = "user_id, is_read"),
        @Index(name = "idx_notification_user_created", columnList = "user_id, created_at DESC")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String message;

    @Column(name = "target_type", length = 50)
    private String targetType;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(name = "target_url", length = 500)
    private String targetUrl;

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
