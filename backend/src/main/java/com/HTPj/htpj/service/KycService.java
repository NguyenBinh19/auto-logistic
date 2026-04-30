package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.kyc.ApproveVerificationRequest;
import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycQueueResponse;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface KycService {
    KycUploadResponse uploadKyc(String userId,KycUploadRequest request, MultipartFile[] files);

    List<KycQueueResponse> getAllPartnerVerifications();

    List<KycQueueResponse> getPartnerVerificationsByStatus(String status);

    KycVerificationDetailResponse getVerificationDetail(Integer verificationId);

    List<KycQueueResponse> getPartnerVerificationsByUserId(String userId);

    void approveVerification(ApproveVerificationRequest request, String reviewedBy);
}
