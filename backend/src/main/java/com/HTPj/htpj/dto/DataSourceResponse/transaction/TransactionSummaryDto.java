package com.HTPj.htpj.dto.DataSourceResponse.transaction;

import java.math.BigDecimal;

public record TransactionSummaryDto(
        BigDecimal totalSpending,
        BigDecimal totalTopup,
        BigDecimal totalPenalty,
        Double spendingGrowth,
        Double topupGrowth,
        Double penaltyGrowth
) {}
