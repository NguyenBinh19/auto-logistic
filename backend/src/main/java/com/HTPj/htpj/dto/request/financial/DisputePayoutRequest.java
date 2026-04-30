package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

@Data
public class DisputePayoutRequest {
    private Long statementId;
    private String description;
}
