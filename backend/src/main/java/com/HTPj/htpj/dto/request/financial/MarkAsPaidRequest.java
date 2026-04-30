package com.HTPj.htpj.dto.request.financial;

import lombok.Data;

import java.util.List;

@Data
public class MarkAsPaidRequest {
    private List<Long> statementIds;
    private String bankReference;
    private String bankName;
    private String bankAccountHolder;
    private String bankAccountNumber;
}
