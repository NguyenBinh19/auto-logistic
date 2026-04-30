package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
import com.HTPj.htpj.dto.request.partner.CreateStaffRequest;
import com.HTPj.htpj.dto.request.partner.UpdateStaffRequest;
import com.HTPj.htpj.dto.response.partner.ListStaffResponse;

import java.util.List;

public interface PartnerService {
    void banPartner(String partnerType, Long partnerId, BanPartnerRequest request, String adminId);

    String createStaff(CreateStaffRequest request);

    List<ListStaffResponse> getStaffList();

    List<ListStaffResponse> getAdminList();

    void lockStaff(String userId);

    void unLockStaff(String userId);

    void updateStaff(UpdateStaffRequest request);

}