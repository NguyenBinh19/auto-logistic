package com.HTPj.htpj.dto.response.financial;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeDetailResponse {
    private Long disputeId;
    private String reasonDetails;
    private String adminReport;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolvedBy;

    private List<String> imageUrls;
}
