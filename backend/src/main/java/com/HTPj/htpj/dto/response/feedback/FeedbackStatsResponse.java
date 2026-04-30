package com.HTPj.htpj.dto.response.feedback;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackStatsResponse {
    private Double averageScore;
    private Double cleanlinessAvg;
    private Double serviceAvg;
    private Integer totalReviews;
    private Integer pendingCount;
    private Integer respondedCount;
}
