package com.HTPj.htpj.dto.request.financial;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolveDisputeRequest {
    private Long disputeId;
    private String adminReport;
}
