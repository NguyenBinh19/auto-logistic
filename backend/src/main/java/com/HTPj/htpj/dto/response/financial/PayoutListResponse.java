package com.HTPj.htpj.dto.response.financial;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PayoutListResponse {
    private List<PayoutListItemResponse> payouts;
    private BigDecimal totalPayoutLiability;
    private Integer totalRecords;
    private Integer pendingCount;
    private Integer readyCount;
    private Integer processingCount;
    private Integer paidCount;
    private Integer blockedCount;
}
