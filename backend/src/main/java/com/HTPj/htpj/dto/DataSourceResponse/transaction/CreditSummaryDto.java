package com.HTPj.htpj.dto.DataSourceResponse.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditSummaryDto(
        BigDecimal remainingCredit,
        BigDecimal debt,
        BigDecimal creditLimit,
        int usedPercent,
        LocalDate dueDate,

        Integer lateDays,
        Integer lateWorkingDays,
        BigDecimal penaltyRate,
        BigDecimal penaltyAmount,

        String status
) {}