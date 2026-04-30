package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.kyc.ApproveVerificationRequest;
import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycQueueResponse;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
import com.HTPj.htpj.service.KycService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/kyc")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class KycController {

    private final KycService kycService;

    @PostMapping(value = "/upload",consumes = "multipart/form-data")
    public ApiResponse<KycUploadResponse> uploadKyc(
            @RequestPart("data") KycUploadRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files
    ) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");
        return ApiResponse.<KycUploadResponse>builder()
                .result(kycService.uploadKyc(userId, request, files))
                .build();
    }
    @GetMapping
    public ApiResponse<List<KycQueueResponse>> getAllPartnerVerifications() {
        return ApiResponse.<List<KycQueueResponse>>builder()
                .result(kycService.getAllPartnerVerifications())
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<List<KycQueueResponse>> getPartnerVerificationsByStatus(
            @RequestParam("status") String status
    ) {
        return ApiResponse.<List<KycQueueResponse>>builder()
                .result(kycService.getPartnerVerificationsByStatus(status))
                .build();
    }

    @GetMapping("/user")
    public ApiResponse<List<KycQueueResponse>> getPartnerVerificationsByUserId() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String managerId = jwt.getClaim("userId");

        return ApiResponse.<List<KycQueueResponse>>builder()
                .result(kycService.getPartnerVerificationsByUserId(managerId))
                .build();
    }

    @GetMapping("/{verificationId}")
    public ApiResponse<KycVerificationDetailResponse> getVerificationDetail(
            @PathVariable Integer verificationId
    ) {
        return ApiResponse.<KycVerificationDetailResponse>builder()
                .result(kycService.getVerificationDetail(verificationId))
                .build();
    }

    @PostMapping("/approve")
    public ApiResponse<String> approveVerification(
            @RequestBody ApproveVerificationRequest request
    ) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();
        String reviewedBy = jwt.getClaim("userId");
        kycService.approveVerification(request, reviewedBy);

        return ApiResponse.<String>builder()
                .result("Verification processed successfully")
                .build();
    }
}