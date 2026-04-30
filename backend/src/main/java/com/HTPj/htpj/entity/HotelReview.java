package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hotel_reviews")
public class HotelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "agency_id")
    private Long agencyId;

    @Column(name = "user_id", length = 255)
    private String userId;

    // người đánh giá (agent/user)
    @Column(name = "reviewer_name", length = 100)
    private String reviewerName;

    // điểm đánh giá: 1–5
    @Column(name = "rating_score", nullable = false)
    private Integer ratingScore;

    @Column(name = "cleanliness_score")
    private Integer cleanlinessScore;

    @Column(name = "service_score")
    private Integer serviceScore;

    @Column(name = "comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "reply", columnDefinition = "NVARCHAR(MAX)")
    private String reply;

    @Column(name = "reply_date")
    private LocalDateTime replyDate;

    @Column(name = "reply_by", length = 255)
    private String replyBy;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
