package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.kyc.ApproveVerificationRequest;
import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
import com.HTPj.htpj.dto.response.kyc.KycDocumentResponse;
import com.HTPj.htpj.dto.response.kyc.KycQueueResponse;
import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.KycDocumentMapper;
import com.HTPj.htpj.mapper.KycMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.KycService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class KycServiceImpl implements KycService {

    private final AgencyRepository agencyRepository;
    private final PartnerVerificationRepository verificationRepository;
    private final PartnerLegalInformationRepository legalInformationRepository;
    private final KycDocumentRepository kycDocumentRepository;
    private final S3Service s3Service;
    private final KycMapper kycMapper;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final CommissionRepository commissionRepository;
    private final RankRepository rankRepository;
    private final NotificationService notificationService;
    private final SystemLogRepository systemLogRepository;
    private final PartnerBlacklistRepository partnerBlacklistRepository;
    private final CommissionLogRepository commissionLogRepository;

    @Override
    public KycUploadResponse uploadKyc(String userId,KycUploadRequest request, MultipartFile[] files) {
        if (request.getBusinessLicenseNumber() != null &&
                partnerBlacklistRepository.existsByBusinessLicenseNumber(request.getBusinessLicenseNumber())) {
            throw new AppException(ErrorCode.BANNED_BUSINESS_LICENSE);
        }

        if (request.getRepresentativeCICNumber() != null &&
                partnerBlacklistRepository.existsByRepresentativeCicNumber(request.getRepresentativeCICNumber())) {
            throw new AppException(ErrorCode.BANNED_CIC_NUMBER);
        }
        Optional<PartnerVerification> latest =
                verificationRepository
                        .findTopBySubmittedByOrderByVersionDesc(userId);

        int newVersion = latest.map(v -> v.getVersion() + 1).orElse(1);

        LocalDateTime now = LocalDateTime.now();

        PartnerVerification verification = PartnerVerification.builder()
                .submittedBy(userId)
                .partnerType(request.getPartnerType())
                .status("PENDING")
                .version(newVersion)
                .submittedAt(now)
                .updatedAt(now)
                .build();


        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (user.getAgency() != null) {
            verification.setAgency(user.getAgency());
        }

        if (user.getHotel() != null) {
            verification.setHotel(user.getHotel());
        }

        verificationRepository.save(verification);

        PartnerLegalInformation legalInfo = PartnerLegalInformation.builder()
                        .verification(verification)
                        .legalName(request.getLegalName())
                        .taxCode(request.getTaxCode())
                        .businessAddress(request.getBusinessAddress())
                        .representativeName(request.getRepresentativeName())
                        .representativeCICNumber(request.getRepresentativeCICNumber())
                        .businessLicenseNumber(request.getBusinessLicenseNumber())
                        .representativeCICDate(request.getRepresentativeCICDate())
                        .representativeCICPlace(request.getRepresentativeCICPlace())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();


        legalInformationRepository.save(legalInfo);

        List<String> documentTypes = request.getDocumentTypes();

        for (int i = 0; i < files.length; i++) {

            MultipartFile file = files[i];

            if (file.isEmpty()) continue;

            String documentType = documentTypes.get(i);

            String key = "kyc/"
                    + userId + "/v"
                    + newVersion + "/"
                    + System.currentTimeMillis()
                    + "_" + file.getOriginalFilename();

            try {
                s3Service.uploadFile(file, key);
            } catch (IOException e) {
                throw new AppException(ErrorCode.KYC_FILE_UPLOAD_FAILED);
            }

            KycDocument document = KycDocument.builder()
                    .verification(verification)
                    .documentType(documentType)
                    .s3ObjectKey(key)
                    .status("PENDING")
                    .isDeleted(false)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            kycDocumentRepository.save(document);
        }

        List<Users> admins = userRepository.findByIsAdminTrue();
        for (Users admin : admins) {
            notificationService.sendNotification(
                    admin.getId(),
                    "KYC",
                    "Có yêu cầu xác minh KYC mới",
                    "Có một hồ sơ KYC mới được gửi lên, vui lòng kiểm tra và duyệt.",
                    "KYC",
                    String.valueOf(verification.getId()),
                    "/admin/kyc-queue"
            );
        }

        return new KycUploadResponse(
                verification.getId(),
                verification.getStatus()
        );
    }

    @Override
    public List<KycQueueResponse> getAllPartnerVerifications() {

        return verificationRepository.findAllWithLegalInformation()
                .stream()
                .map(kycMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<KycQueueResponse> getPartnerVerificationsByStatus(String status) {
        return verificationRepository.findByStatusWithLegalInformation(status)
                .stream()
                .map(kycMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public KycVerificationDetailResponse getVerificationDetail(Integer verificationId) {

        PartnerVerification verification =
                verificationRepository.findDetailById(verificationId)
                        .orElseThrow(() -> new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND));

        KycVerificationDetailResponse response = kycMapper.toDetailResponse(verification);

        List<KycDocumentResponse> documents =
                verification.getDocuments()
                        .stream()
                        .filter(doc -> !doc.getIsDeleted())
                        .map(doc -> {
                            KycDocumentResponse r = new KycDocumentResponse();
                            r.setId(doc.getId());
                            r.setDocumentType(doc.getDocumentType());
                            r.setStatus(doc.getStatus());
                            r.setFileUrl(s3Service.getFileUrl(doc.getS3ObjectKey()));
                            return r;
                        })
                        .toList();

        response.setDocuments(documents);

        return response;
    }

    @Override
    public List<KycQueueResponse> getPartnerVerificationsByUserId(String userId) {
        return verificationRepository.findByUserIdWithLegalInformation(userId)
                .stream()
                .map(kycMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void saveCommissionLog(
            Hotel hotel,
            Commission commission,
            String userId,
            String note
    ) {
        CommissionLog log = new CommissionLog();

        log.setHotelId(Long.valueOf(hotel.getHotelId()));

        // hotel mới tạo → chưa có commission cũ
        log.setOldCommissionId(null);
        log.setOldValue(null);
        log.setOldCommissionType(null);

        log.setNewCommissionId(commission.getCommissionId());
        log.setNewValue(commission.getCommissionValue());
        log.setNewCommissionType(commission.getCommissionType());

        log.setChangedBy(userId);
        log.setChangedAt(LocalDateTime.now());
        log.setNote(note);

        commissionLogRepository.save(log);
    }
    @Override
    public void approveVerification(ApproveVerificationRequest request, String reviewedBy) {

        PartnerVerification verification = verificationRepository
                .findById(request.getVerificationId())
                .orElseThrow(() -> new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND));

        verification.setReviewedBy(reviewedBy);
        verification.setReviewedAt(LocalDateTime.now());
        verification.setStatus(request.getStatus());
        verification.setRejectionReason(request.getRejectionReason());

        String navigateUrl = "/"; // default trước

        String actionDescription="";
        boolean isApproved = "VERIFIED".equalsIgnoreCase(request.getStatus());
        String message;
        String title = isApproved
                ? "KYC đã được duyệt"
                : "KYC bị từ chối";
        if (isApproved) {
            message = "Xác minh KYC của bạn đã được chấp thuận";
        } else {
            message = "KYC của bạn đã bị từ chối";
        }
        if ("VERIFIED".equalsIgnoreCase(request.getStatus())) {
            Users user = userRepository.findById(verification.getSubmittedBy())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));


            if (verification.getLegalInformation() == null) {
                throw new AppException(ErrorCode.KYC_VERIFICATION_NOT_FOUND);
            }

            if (Boolean.TRUE.equals(request.getVerificationBefore())) {
                verificationRepository.save(verification);

                SystemLog log = new SystemLog();
                log.setUserId(reviewedBy);
                log.setAction("Duyệt cập nhật hồ sơ mã: " + request.getVerificationId());
                log.setUpdatedAt(LocalDateTime.now());
                systemLogRepository.save(log);

                return;
            }

            String legalName = verification.getLegalInformation().getLegalName();
            String address = verification.getLegalInformation().getBusinessAddress();
            String partnerType = verification.getPartnerType();

            if ("hotel".equalsIgnoreCase(partnerType)) {
                LocalDateTime now = LocalDateTime.now();

                List<Commission> validDeals = commissionRepository.findValidDeal(now);

                Commission selectedCommission = null;

                //deal
                if (!validDeals.isEmpty()) {
                    if (validDeals.size() == 1) {
                        selectedCommission = validDeals.get(0);
                    } else {
                        selectedCommission = validDeals.stream()
                                .max(Comparator.comparing(Commission::getCreatedAt))
                                .orElse(null);
                    }
                    //default
                } else {
                    selectedCommission = commissionRepository.findDefault()
                            .orElseThrow(() -> new RuntimeException("Default commission not found"));
                }

                //create hotel
                Hotel hotel = new Hotel();
                hotel.setHotelName(legalName);
                hotel.setAddress(address);
                hotel.setStatus("ACTIVE");

                hotel.setCreatedAt(now);
                hotel.setUpdatedAt(now);

                hotel.setCommissionValue(selectedCommission.getCommissionValue());
                hotel.setRateType(selectedCommission.getRateType());
                hotel.setCommissionId(selectedCommission.getCommissionId());
                hotel.setCommissionType(selectedCommission.getCommissionType());
                hotel.setCommissionUpdatedAt(now);
                hotel.setCommissionUpdatedBy(reviewedBy);

                Hotel savedHotel = hotelRepository.save(hotel);

                saveCommissionLog(
                        savedHotel,
                        selectedCommission,
                        reviewedBy,
                        "Áp dụng hoa hồng mặc định khi duyệt KYC (tạo khách sạn)"
                );

                verification.setHotel(savedHotel);
                user.setHotel(savedHotel);
                userRepository.save(user);
                navigateUrl = "/hotel/dashboard";
                Hotel hot = verification.getHotel();
                actionDescription = String.format("Duyệt hồ sơ cho hotel: %d - %s",
                        hot.getHotelId(), hot.getHotelName());
            }

            else if ("agency".equalsIgnoreCase(partnerType)) {
                Rank basicRank = rankRepository.findByRankCode("BASIC")
                        .orElseThrow(() -> new AppException(ErrorCode.RANK_NOT_FOUND));

                LocalDateTime now = LocalDateTime.now();

                Agency agency = new Agency();
                agency.setAgencyName(legalName);
                agency.setAddress(address);
                agency.setStatus("ACTIVE");

                agency.setCreatedAt(now);
                agency.setUpdatedAt(now);

                agency.setRank(basicRank);
                agency.setCreditLimit(BigDecimal.ZERO);
                agency.setCurrentCredit(BigDecimal.ZERO);
                agency.setWalletBalance(BigDecimal.ZERO);

                Agency savedAgency = agencyRepository.save(agency);
                verification.setAgency(savedAgency);
                user.setAgency(savedAgency);
                userRepository.save(user);
                navigateUrl = "/agency/dashboard";
                Agency agenc = verification.getAgency();
                actionDescription = String.format("Duyệt hồ sơ cho agency: %d - %s",
                        agenc.getAgencyId(), agenc.getAgencyName());
            }
        }
        else {
            actionDescription = String.format("Từ chối hồ sơ mã %d với lý do %s",
                    request.getVerificationId(), request.getRejectionReason());
            navigateUrl = "/kyc/status";
        }

        verificationRepository.save(verification);

        SystemLog log = new SystemLog();
        log.setUserId(reviewedBy);
        log.setAction(actionDescription);
        log.setUpdatedAt(LocalDateTime.now());
        systemLogRepository.save(log);

        notificationService.sendNotification(verification.getSubmittedBy(), "KYC",
                title,
                message,
                "KYC", String.valueOf(verification.getId()), navigateUrl);
    }

}