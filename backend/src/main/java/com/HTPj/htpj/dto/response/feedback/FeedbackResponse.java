package com.HTPj.htpj.dto.response.feedback;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackResponse {
    Integer reviewId;
    Long bookingId;
    String bookingCode;

    // Hotel info
    Integer hotelId;
    String hotelName;

    // Agency info
    Long agencyId;
    String agencyName;
    String reviewerName;

    // Dates from booking
    String stayDates;

    // Scores
    Integer ratingScore;
    Integer cleanlinessScore;
    Integer serviceScore;

    String comment;
    LocalDateTime createdAt;

    // Reply
    String reply;
    LocalDateTime replyDate;
    String replyBy;
    String status;
}
