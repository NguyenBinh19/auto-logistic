package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.DataSourceResponse.transaction.CreditSummaryDto;
import com.HTPj.htpj.dto.request.agency.UpdateAgencyRequest;
import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.dto.response.agency.AgencyUserBookingResponse;

import java.math.BigDecimal;
import java.util.List;

public interface AgencyService {
    List<AgencyResponse> getAllAgencies();

    //admin
    AgencyDetailResponse getAgencyDetail(Long agencyId);

    //agency
    AgencyDetailResponse getAgencyDetail();

    AgencyDetailResponse updateAgency( UpdateAgencyRequest request);

    AgencyDetailResponse findAgencyFinanceInfo(Long id);

    AgencyDetailResponse findAgencyFinanceInfoHeader(Long id);

    CreditSummaryDto getCreditSummary(Long agencyId);

    void payDebt(Long agencyId, BigDecimal payment) throws Exception;

    List<AgencyUserBookingResponse> getAgencyUserBookingSummary();
}
