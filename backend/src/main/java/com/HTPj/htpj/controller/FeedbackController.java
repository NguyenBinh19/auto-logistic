package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.feedback.ReplyFeedbackRequest;
import com.HTPj.htpj.dto.request.feedback.SubmitFeedbackRequest;
import com.HTPj.htpj.dto.response.feedback.FeedbackResponse;
import com.HTPj.htpj.dto.response.feedback.FeedbackStatsResponse;
import com.HTPj.htpj.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FeedbackController {

    FeedbackService feedbackService;

    // UC-032: Submit feedback for a completed booking
    @PostMapping
    ApiResponse<FeedbackResponse> submitFeedback(@RequestBody @Valid SubmitFeedbackRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Đánh giá thành công!")
                .result(feedbackService.submitFeedback(request))
                .build();
    }

    // UC-033: Get my feedback history (Agency)
    @GetMapping("/history")
    ApiResponse<Page<FeedbackResponse>> getMyFeedbackHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(feedbackService.getMyFeedbackHistory(pageable))
                .build();
    }

    // UC-055: Get feedback for my hotel (Hotel Owner)
    @GetMapping("/my-hotel")
    ApiResponse<Page<FeedbackResponse>> getHotelFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(feedbackService.getHotelFeedback(pageable))
                .build();
    }

    // UC-055: Get hotel feedback stats/dashboard
    @GetMapping("/my-hotel/stats")
    ApiResponse<FeedbackStatsResponse> getHotelFeedbackStats() {
        return ApiResponse.<FeedbackStatsResponse>builder()
                .result(feedbackService.getHotelFeedbackStats())
                .build();
    }

    // UC-055: Reply to a review (Hotel Owner)
    @PostMapping("/{reviewId}/reply")
    ApiResponse<FeedbackResponse> replyToFeedback(
            @PathVariable Integer reviewId,
            @RequestBody @Valid ReplyFeedbackRequest request) {
        return ApiResponse.<FeedbackResponse>builder()
                .message("Phản hồi đã được gửi thành công!")
                .result(feedbackService.replyToFeedback(reviewId, request))
                .build();
    }
}
