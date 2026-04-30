package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

@Data
public class ConfirmPayoutRequest {
    private Long statementId;
    private String bankName;
    private String bankAccountHolder;
    private String bankAccountNumber;
}
