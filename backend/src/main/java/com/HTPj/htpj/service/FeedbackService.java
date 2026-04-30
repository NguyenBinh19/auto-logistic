package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.feedback.ReplyFeedbackRequest;
import com.HTPj.htpj.dto.request.feedback.SubmitFeedbackRequest;
import com.HTPj.htpj.dto.response.feedback.FeedbackResponse;
import com.HTPj.htpj.dto.response.feedback.FeedbackStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedbackService {
    // UC-032: Submit feedback
    FeedbackResponse submitFeedback(SubmitFeedbackRequest request);

    // UC-033: Agency feedback history
    Page<FeedbackResponse> getMyFeedbackHistory(Pageable pageable);

    // UC-055: Hotel's received feedback
    Page<FeedbackResponse> getHotelFeedback(Pageable pageable);

    // UC-055: Hotel feedback stats
    FeedbackStatsResponse getHotelFeedbackStats();

    // UC-055: Hotel reply to feedback
    FeedbackResponse replyToFeedback(Integer reviewId, ReplyFeedbackRequest request);
}
