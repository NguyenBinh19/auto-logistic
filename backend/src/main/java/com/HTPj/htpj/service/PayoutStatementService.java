package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.financial.*;
import com.HTPj.htpj.dto.response.financial.DisputeDetailResponse;
import com.HTPj.htpj.dto.response.financial.PayoutListResponse;
import com.HTPj.htpj.dto.response.financial.PayoutStatementResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface PayoutStatementService {

    // Generate payout statements for a billing cycle (26th prev month -> 25th current month)
    List<PayoutStatementResponse> generateStatementsForPeriod(LocalDate periodStart, LocalDate periodEnd);

    // Auto-generate statements for the current billing cycle
    List<PayoutStatementResponse> generateCurrentCycleStatements();

    // UC-070: Hotel views their settlement statements
    List<PayoutStatementResponse> getHotelStatements(Integer hotelId);

    // UC-070: Hotel views statement detail
    PayoutStatementResponse getStatementDetail(Long statementId);

    // UC-070: Hotel confirms payout (BR-FIN-01)
    PayoutStatementResponse confirmPayout(ConfirmPayoutRequest request);

    // UC-070: Hotel disputes a statement
    PayoutStatementResponse disputePayout(DisputePayoutRequest request);

    // UC-088: Admin views payout list
    PayoutListResponse getPayoutList(PayoutListRequest request);

    // UC-088: Admin marks payouts as paid
    List<PayoutStatementResponse> markAsPaid(MarkAsPaidRequest request, MultipartFile proofImage);

    // UC-088: Admin exports batch payment file — updates status to PROCESSING
//    List<PayoutStatementResponse> exportBatchPayment(List<Long> statementIds);

    void resolveDispute(ResolveDisputeRequest request, MultipartFile[] files);

    DisputeDetailResponse getDisputeDetail(Long statementId);

    List<PayoutStatementResponse> getDisputedStatements();
}
