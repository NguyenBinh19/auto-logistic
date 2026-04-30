//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.kyc.ApproveVerificationRequest;
//import com.HTPj.htpj.dto.request.kyc.KycUploadRequest;
//import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
//import com.HTPj.htpj.dto.response.kyc.KycUploadResponse;
//import com.HTPj.htpj.entity.Agency;
//import com.HTPj.htpj.entity.Commission;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.KycDocument;
//import com.HTPj.htpj.entity.PartnerLegalInformation;
//import com.HTPj.htpj.entity.PartnerVerification;
//import com.HTPj.htpj.entity.Rank;
//import com.HTPj.htpj.entity.SystemLog;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.KycMapper;
//import com.HTPj.htpj.repository.AgencyRepository;
//import com.HTPj.htpj.repository.CommissionRepository;
//import com.HTPj.htpj.repository.HotelRepository;
//import com.HTPj.htpj.repository.KycDocumentRepository;
//import com.HTPj.htpj.repository.PartnerBlacklistRepository;
//import com.HTPj.htpj.repository.PartnerLegalInformationRepository;
//import com.HTPj.htpj.repository.PartnerVerificationRepository;
//import com.HTPj.htpj.repository.RankRepository;
//import com.HTPj.htpj.repository.SystemLogRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.KycServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mock.web.MockMultipartFile;
//
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertNull;
//import static org.junit.jupiter.api.Assertions.assertSame;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.BDDMockito.given;
//import static org.mockito.BDDMockito.then;
//import static org.mockito.BDDMockito.willThrow;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.times;
//
//@ExtendWith(MockitoExtension.class)
//class KycServiceImplTest {
//    @Mock private AgencyRepository agencyRepository;
//    @Mock private PartnerVerificationRepository verificationRepository;
//    @Mock private PartnerLegalInformationRepository legalInformationRepository;
//    @Mock private KycDocumentRepository kycDocumentRepository;
//    @Mock private S3Service s3Service;
//    @Mock private KycMapper kycMapper;
//    @Mock private HotelRepository hotelRepository;
//    @Mock private CommissionRepository commissionRepository;
//    @Mock private UserRepository userRepository;
//    @Mock private RankRepository rankRepository;
//    @Mock private NotificationService notificationService;
//    @Mock private SystemLogRepository systemLogRepository;
//    @Mock private PartnerBlacklistRepository partnerBlacklistRepository;
//
//    @InjectMocks
//    private KycServiceImpl kycService;
//
//    //uploadkyc
//    @Test
//    void uploadKyc_BusinessLicenseBlacklisted_ThrowsBannedBusinessLicense() {
//        KycUploadRequest request = baseRequest();
//        given(partnerBlacklistRepository.existsByBusinessLicenseNumber("BL-001")).willReturn(true);
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.uploadKyc("user-1", request, new MockMultipartFile[0])
//        );
//
//        assertEquals(ErrorCode.BANNED_BUSINESS_LICENSE, exception.getErrorCode());
//        then(partnerBlacklistRepository).should().existsByBusinessLicenseNumber("BL-001");
//        then(verificationRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void uploadKyc_CicNumberBlacklisted_ThrowsBannedCicNumber() {
//        KycUploadRequest request = baseRequest();
//        request.setBusinessLicenseNumber(null);
//        given(partnerBlacklistRepository.existsByRepresentativeCicNumber("CIC-001")).willReturn(true);
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.uploadKyc("user-1", request, new MockMultipartFile[0])
//        );
//
//        assertEquals(ErrorCode.BANNED_CIC_NUMBER, exception.getErrorCode());
//        then(partnerBlacklistRepository).should().existsByRepresentativeCicNumber("CIC-001");
//        then(verificationRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void uploadKyc_UserNotFound_ThrowsUserNotExisted() {
//        String userId = "missing-user";
//        KycUploadRequest request = baseRequest();
//        MockMultipartFile[] files = filesWithSingleDocument();
//
//        given(partnerBlacklistRepository.existsByBusinessLicenseNumber(anyString())).willReturn(false);
//        given(partnerBlacklistRepository.existsByRepresentativeCicNumber(anyString())).willReturn(false);
//        given(verificationRepository.findTopBySubmittedByOrderByVersionDesc(userId)).willReturn(Optional.empty());
//        given(userRepository.findById(userId)).willReturn(Optional.empty());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.uploadKyc(userId, request, files)
//        );
//
//        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
//        then(verificationRepository).should(never()).save(any(PartnerVerification.class));
//        then(legalInformationRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void uploadKyc_InitialVersionWithAgencyAndEmptyFile_SavesExpectedEntitiesAndReturnsResponse() throws IOException {
//        String userId = "partner-1";
//        Agency agency = Agency.builder().agencyId(11L).agencyName("A11").build();
//        Users user = Users.builder().id(userId).agency(agency).build();
//        Users admin1 = Users.builder().id("admin-1").build();
//        Users admin2 = Users.builder().id("admin-2").build();
//
//        KycUploadRequest request = baseRequest();
//        request.setDocumentTypes(List.of("BUSINESS_LICENSE", "REPRESENTATIVE_CIC"));
//        MockMultipartFile nonEmpty = new MockMultipartFile("files", "license.pdf", "application/pdf", "file-a".getBytes());
//        MockMultipartFile empty = new MockMultipartFile("files", "empty.pdf", "application/pdf", new byte[0]);
//        MockMultipartFile[] files = new MockMultipartFile[]{nonEmpty, empty};
//
//        given(partnerBlacklistRepository.existsByBusinessLicenseNumber(anyString())).willReturn(false);
//        given(partnerBlacklistRepository.existsByRepresentativeCicNumber(anyString())).willReturn(false);
//        given(verificationRepository.findTopBySubmittedByOrderByVersionDesc(userId)).willReturn(Optional.empty());
//        given(userRepository.findById(userId)).willReturn(Optional.of(user));
//        given(userRepository.findByIsAdminTrue()).willReturn(List.of(admin1, admin2));
//        given(verificationRepository.save(any(PartnerVerification.class))).willAnswer(invocation -> {
//            PartnerVerification value = invocation.getArgument(0);
//            value.setId(101);
//            return value;
//        });
//
//        KycUploadResponse response = kycService.uploadKyc(userId, request, files);
//
//        ArgumentCaptor<PartnerVerification> verificationCaptor = ArgumentCaptor.forClass(PartnerVerification.class);
//        then(verificationRepository).should().save(verificationCaptor.capture());
//        PartnerVerification savedVerification = verificationCaptor.getValue();
//        assertEquals(1, savedVerification.getVersion());
//        assertEquals("PENDING", savedVerification.getStatus());
//        assertEquals("agency", savedVerification.getPartnerType());
//        assertEquals(userId, savedVerification.getSubmittedBy());
//        assertSame(agency, savedVerification.getAgency());
//        assertNull(savedVerification.getHotel());
//
//        ArgumentCaptor<PartnerLegalInformation> legalInfoCaptor = ArgumentCaptor.forClass(PartnerLegalInformation.class);
//        then(legalInformationRepository).should().save(legalInfoCaptor.capture());
//        PartnerLegalInformation legalInfo = legalInfoCaptor.getValue();
//        assertSame(savedVerification, legalInfo.getVerification());
//        assertEquals("Legal Company", legalInfo.getLegalName());
//        assertEquals("TAX-001", legalInfo.getTaxCode());
//        assertEquals("BL-001", legalInfo.getBusinessLicenseNumber());
//        assertEquals("CIC-001", legalInfo.getRepresentativeCICNumber());
//
//        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
//        then(s3Service).should().uploadFile(eq(nonEmpty), keyCaptor.capture());
//        assertTrue(keyCaptor.getValue().startsWith("kyc/partner-1/v1/"));
//
//        ArgumentCaptor<KycDocument> documentCaptor = ArgumentCaptor.forClass(KycDocument.class);
//        then(kycDocumentRepository).should(times(1)).save(documentCaptor.capture());
//        KycDocument savedDocument = documentCaptor.getValue();
//        assertSame(savedVerification, savedDocument.getVerification());
//        assertEquals("BUSINESS_LICENSE", savedDocument.getDocumentType());
//        assertEquals("PENDING", savedDocument.getStatus());
//        assertEquals(false, savedDocument.getIsDeleted());
//        assertTrue(savedDocument.getS3ObjectKey().startsWith("kyc/partner-1/v1/"));
//
//        ArgumentCaptor<String> adminIdCaptor = ArgumentCaptor.forClass(String.class);
//        then(notificationService).should(times(2)).sendNotification(
//                adminIdCaptor.capture(),
//                eq("KYC"),
//                eq("New KYC Submission"),
//                eq("A new KYC verification has been submitted for review."),
//                eq("KYC"),
//                eq("101"),
//                eq("/admin/kyc-queue")
//        );
//        assertEquals(List.of("admin-1", "admin-2"), adminIdCaptor.getAllValues());
//
//        assertEquals(101, response.getVerificationId());
//        assertEquals("PENDING", response.getStatus());
//    }
//
//    @Test
//    void uploadKyc_PreviousVersionExistsWithHotel_IncrementsVersionAndLinksHotel() throws IOException {
//        String userId = "partner-2";
//        Hotel hotel = Hotel.builder().hotelId(44).hotelName("H44").address("addr").build();
//        Users user = Users.builder().id(userId).hotel(hotel).build();
//        PartnerVerification latest = PartnerVerification.builder().id(9).version(3).build();
//        KycUploadRequest request = baseRequest();
//        MockMultipartFile[] files = filesWithSingleDocument();
//
//        given(partnerBlacklistRepository.existsByBusinessLicenseNumber(anyString())).willReturn(false);
//        given(partnerBlacklistRepository.existsByRepresentativeCicNumber(anyString())).willReturn(false);
//        given(verificationRepository.findTopBySubmittedByOrderByVersionDesc(userId)).willReturn(Optional.of(latest));
//        given(userRepository.findById(userId)).willReturn(Optional.of(user));
//        given(userRepository.findByIsAdminTrue()).willReturn(List.of());
//        given(verificationRepository.save(any(PartnerVerification.class))).willAnswer(invocation -> {
//            PartnerVerification value = invocation.getArgument(0);
//            value.setId(202);
//            return value;
//        });
//
//        KycUploadResponse response = kycService.uploadKyc(userId, request, files);
//
//        ArgumentCaptor<PartnerVerification> verificationCaptor = ArgumentCaptor.forClass(PartnerVerification.class);
//        then(verificationRepository).should().save(verificationCaptor.capture());
//        PartnerVerification savedVerification = verificationCaptor.getValue();
//        assertEquals(4, savedVerification.getVersion());
//        assertSame(hotel, savedVerification.getHotel());
//        assertNull(savedVerification.getAgency());
//
//        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
//        then(s3Service).should().uploadFile(eq(files[0]), keyCaptor.capture());
//        assertTrue(keyCaptor.getValue().contains("/v4/"));
//
//        then(notificationService).shouldHaveNoInteractions();
//        assertEquals(202, response.getVerificationId());
//        assertEquals("PENDING", response.getStatus());
//    }
//
//    @Test
//    void uploadKyc_S3UploadThrowsIOException_ThrowsKycFileUploadFailed() throws IOException {
//        String userId = "partner-3";
//        Users user = Users.builder().id(userId).build();
//        KycUploadRequest request = baseRequest();
//        MockMultipartFile[] files = filesWithSingleDocument();
//
//        given(partnerBlacklistRepository.existsByBusinessLicenseNumber(anyString())).willReturn(false);
//        given(partnerBlacklistRepository.existsByRepresentativeCicNumber(anyString())).willReturn(false);
//        given(verificationRepository.findTopBySubmittedByOrderByVersionDesc(userId)).willReturn(Optional.empty());
//        given(userRepository.findById(userId)).willReturn(Optional.of(user));
//        given(verificationRepository.save(any(PartnerVerification.class))).willAnswer(invocation -> {
//            PartnerVerification value = invocation.getArgument(0);
//            value.setId(303);
//            return value;
//        });
//        willThrow(new IOException("s3 down")).given(s3Service).uploadFile(any(), anyString());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.uploadKyc(userId, request, files)
//        );
//
//        assertEquals(ErrorCode.KYC_FILE_UPLOAD_FAILED, exception.getErrorCode());
//        then(legalInformationRepository).should().save(any(PartnerLegalInformation.class));
//        then(kycDocumentRepository).shouldHaveNoInteractions();
//        then(userRepository).should(never()).findByIsAdminTrue();
//        then(notificationService).shouldHaveNoInteractions();
//    }
//
//    private KycUploadRequest baseRequest() {
//        return KycUploadRequest.builder()
//                .partnerType("agency")
//                .legalName("Legal Company")
//                .taxCode("TAX-001")
//                .businessAddress("123 Main Street")
//                .representativeName("John Doe")
//                .representativeCICNumber("CIC-001")
//                .businessLicenseNumber("BL-001")
//                .representativeCICDate(LocalDate.of(2020, 1, 1))
//                .representativeCICPlace("HCMC")
//                .documentTypes(List.of("BUSINESS_LICENSE"))
//                .build();
//    }
//
//    private MockMultipartFile[] filesWithSingleDocument() {
//        return new MockMultipartFile[]{
//                new MockMultipartFile("files", "license.pdf", "application/pdf", "file-a".getBytes())
//        };
//    }
//
//    //approve
//
//    @Test
//    void approveVerification_VerificationNotFound_ThrowsKycVerificationNotFound() {
//        ApproveVerificationRequest request = approveRequest(10, "VERIFIED", null, false);
//        given(verificationRepository.findById(10)).willReturn(Optional.empty());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.approveVerification(request, "admin-1")
//        );
//
//        assertEquals(ErrorCode.KYC_VERIFICATION_NOT_FOUND, exception.getErrorCode());
//        then(verificationRepository).should().findById(10);
//        then(systemLogRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedUserMissing_ThrowsUserNotExisted() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(11)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-11")
//                .legalInformation(baseLegalInformation())
//                .build();
//        ApproveVerificationRequest request = approveRequest(11, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(11)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-11")).willReturn(Optional.empty());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.approveVerification(request, "admin-1")
//        );
//
//        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
//        then(verificationRepository).should(never()).save(any(PartnerVerification.class));
//        then(systemLogRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedLegalInformationMissing_ThrowsKycVerificationNotFound() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(12)
//                .status("PENDING")
//                .partnerType("agency")
//                .submittedBy("user-12")
//                .build();
//        Users submitter = Users.builder().id("user-12").build();
//        ApproveVerificationRequest request = approveRequest(12, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(12)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-12")).willReturn(Optional.of(submitter));
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.approveVerification(request, "admin-1")
//        );
//
//        assertEquals(ErrorCode.KYC_VERIFICATION_NOT_FOUND, exception.getErrorCode());
//        then(verificationRepository).should(never()).save(any(PartnerVerification.class));
//        then(systemLogRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_Rejected_SavesReasonInSystemLogAndSendsRejectedNotification() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(13)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-13")
//                .build();
//        ApproveVerificationRequest request = approveRequest(13, "REJECTED", "Missing papers", false);
//
//        given(verificationRepository.findById(13)).willReturn(Optional.of(verification));
//
//        kycService.approveVerification(request, "admin-1");
//
//        ArgumentCaptor<SystemLog> systemLogCaptor = ArgumentCaptor.forClass(SystemLog.class);
//        then(systemLogRepository).should().save(systemLogCaptor.capture());
//        SystemLog log = systemLogCaptor.getValue();
//        assertEquals("admin-1", log.getUserId());
//        assertTrue(log.getAction().contains("Missing papers"));
//
//        then(notificationService).should().sendNotification(
//                eq("user-13"),
//                eq("KYC"),
//                eq("KYC Verification Rejected"),
//                eq("Your KYC verification has been rejected."),
//                eq("KYC"),
//                eq("13"),
//                eq("/partner/kyc")
//        );
//        then(hotelRepository).shouldHaveNoInteractions();
//        then(agencyRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedWithVerificationBeforeTrue_OnlySavesVerificationAndSystemLog() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(14)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-14")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-14").build();
//        ApproveVerificationRequest request = approveRequest(14, "VERIFIED", null, true);
//
//        given(verificationRepository.findById(14)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-14")).willReturn(Optional.of(submitter));
//
//        kycService.approveVerification(request, "admin-1");
//
//        then(verificationRepository).should().save(verification);
//        ArgumentCaptor<SystemLog> systemLogCaptor = ArgumentCaptor.forClass(SystemLog.class);
//        then(systemLogRepository).should().save(systemLogCaptor.capture());
//        assertTrue(systemLogCaptor.getValue().getAction().contains("Duyệt cập nhật hồ sơ mã: 14"));
//
//        then(hotelRepository).shouldHaveNoInteractions();
//        then(agencyRepository).shouldHaveNoInteractions();
//        then(userRepository).should(never()).save(any(Users.class));
//        then(notificationService).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedHotelWithMultipleDeals_UsesLatestDealAndCreatesHotel() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(15)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-15")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-15").build();
//
//        Commission oldDeal = Commission.builder()
//                .commissionId(1L)
//                .commissionType("DEAL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("8.5"))
//                .createdAt(LocalDateTime.of(2025, 1, 1, 0, 0))
//                .build();
//        Commission latestDeal = Commission.builder()
//                .commissionId(2L)
//                .commissionType("DEAL")
//                .rateType("FIXED")
//                .commissionValue(new BigDecimal("10.0"))
//                .createdAt(LocalDateTime.of(2025, 6, 1, 0, 0))
//                .build();
//        Hotel persistedHotel = Hotel.builder().hotelId(150).hotelName("Legal Company").build();
//        ApproveVerificationRequest request = approveRequest(15, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(15)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-15")).willReturn(Optional.of(submitter));
//        given(commissionRepository.findValidDeal(any(LocalDateTime.class))).willReturn(List.of(oldDeal, latestDeal));
//        given(hotelRepository.save(any(Hotel.class))).willReturn(persistedHotel);
//
//        kycService.approveVerification(request, "admin-1");
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should().save(hotelCaptor.capture());
//        Hotel savedHotel = hotelCaptor.getValue();
//        assertEquals("Legal Company", savedHotel.getHotelName());
//        assertEquals("123 Main Street", savedHotel.getAddress());
//        assertEquals("ACTIVE", savedHotel.getStatus());
//        assertEquals(new BigDecimal("10.0"), savedHotel.getCommissionValue());
//        assertEquals("FIXED", savedHotel.getRateType());
//        assertEquals(2L, savedHotel.getCommissionId());
//        assertEquals("DEAL", savedHotel.getCommissionType());
//        assertEquals("admin-1", savedHotel.getCommissionUpdatedBy());
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        then(userRepository).should().save(userCaptor.capture());
//        assertSame(persistedHotel, userCaptor.getValue().getHotel());
//
//        ArgumentCaptor<SystemLog> systemLogCaptor = ArgumentCaptor.forClass(SystemLog.class);
//        then(systemLogRepository).should().save(systemLogCaptor.capture());
//        assertTrue(systemLogCaptor.getValue().getAction().contains("Duyệt hồ sơ cho hotel: 150 - Legal Company"));
//
//        then(notificationService).should().sendNotification(
//                eq("user-15"),
//                eq("KYC"),
//                eq("KYC Verification Approved"),
//                eq("Your KYC verification has been approved."),
//                eq("KYC"),
//                eq("15"),
//                eq("/partner/kyc")
//        );
//        then(commissionRepository).should(never()).findDefault();
//    }
//
//    @Test
//    void approveVerification_VerifiedHotelWithSingleDeal_UsesThatDeal() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(16)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-16")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-16").build();
//
//        Commission singleDeal = Commission.builder()
//                .commissionId(3L)
//                .commissionType("DEAL")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("7.0"))
//                .createdAt(LocalDateTime.of(2025, 5, 1, 0, 0))
//                .build();
//        Hotel persistedHotel = Hotel.builder().hotelId(160).hotelName("Legal Company").build();
//        ApproveVerificationRequest request = approveRequest(16, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(16)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-16")).willReturn(Optional.of(submitter));
//        given(commissionRepository.findValidDeal(any(LocalDateTime.class))).willReturn(List.of(singleDeal));
//        given(hotelRepository.save(any(Hotel.class))).willReturn(persistedHotel);
//
//        kycService.approveVerification(request, "admin-1");
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should().save(hotelCaptor.capture());
//        assertEquals(3L, hotelCaptor.getValue().getCommissionId());
//        then(commissionRepository).should(never()).findDefault();
//    }
//
//    @Test
//    void approveVerification_VerifiedHotelNoDeals_UsesDefaultCommission() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(17)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-17")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-17").build();
//
//        Commission defaultCommission = Commission.builder()
//                .commissionId(4L)
//                .commissionType("DEFAULT")
//                .rateType("PERCENT")
//                .commissionValue(new BigDecimal("12.0"))
//                .createdAt(LocalDateTime.of(2024, 1, 1, 0, 0))
//                .build();
//        Hotel persistedHotel = Hotel.builder().hotelId(170).hotelName("Legal Company").build();
//        ApproveVerificationRequest request = approveRequest(17, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(17)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-17")).willReturn(Optional.of(submitter));
//        given(commissionRepository.findValidDeal(any(LocalDateTime.class))).willReturn(List.of());
//        given(commissionRepository.findDefault()).willReturn(Optional.of(defaultCommission));
//        given(hotelRepository.save(any(Hotel.class))).willReturn(persistedHotel);
//
//        kycService.approveVerification(request, "admin-1");
//
//        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
//        then(hotelRepository).should().save(hotelCaptor.capture());
//        assertEquals(4L, hotelCaptor.getValue().getCommissionId());
//        then(commissionRepository).should().findDefault();
//    }
//
//    @Test
//    void approveVerification_VerifiedHotelNoDealsAndNoDefault_ThrowsRuntimeException() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(18)
//                .status("PENDING")
//                .partnerType("hotel")
//                .submittedBy("user-18")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-18").build();
//        ApproveVerificationRequest request = approveRequest(18, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(18)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-18")).willReturn(Optional.of(submitter));
//        given(commissionRepository.findValidDeal(any(LocalDateTime.class))).willReturn(List.of());
//        given(commissionRepository.findDefault()).willReturn(Optional.empty());
//
//        RuntimeException exception = assertThrows(
//                RuntimeException.class,
//                () -> kycService.approveVerification(request, "admin-1")
//        );
//
//        assertEquals("Default commission not found", exception.getMessage());
//        then(hotelRepository).shouldHaveNoInteractions();
//        then(systemLogRepository).shouldHaveNoInteractions();
//        then(notificationService).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedAgency_RankMissing_ThrowsRankNotFound() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(19)
//                .status("PENDING")
//                .partnerType("agency")
//                .submittedBy("user-19")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-19").build();
//        ApproveVerificationRequest request = approveRequest(19, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(19)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-19")).willReturn(Optional.of(submitter));
//        given(rankRepository.findByRankCode("BASIC")).willReturn(Optional.empty());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.approveVerification(request, "admin-1")
//        );
//
//        assertEquals(ErrorCode.RANK_NOT_FOUND, exception.getErrorCode());
//        then(agencyRepository).shouldHaveNoInteractions();
//        then(systemLogRepository).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void approveVerification_VerifiedAgency_CreatesAgencyWithZeroBalancesAndSendsApprovedNotification() {
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(20)
//                .status("PENDING")
//                .partnerType("agency")
//                .submittedBy("user-20")
//                .legalInformation(baseLegalInformation())
//                .build();
//        Users submitter = Users.builder().id("user-20").build();
//        Rank basicRank = Rank.builder().id(1).rankCode("BASIC").build();
//        Agency persistedAgency = Agency.builder().agencyId(200L).agencyName("Legal Company").build();
//        ApproveVerificationRequest request = approveRequest(20, "VERIFIED", null, false);
//
//        given(verificationRepository.findById(20)).willReturn(Optional.of(verification));
//        given(userRepository.findById("user-20")).willReturn(Optional.of(submitter));
//        given(rankRepository.findByRankCode("BASIC")).willReturn(Optional.of(basicRank));
//        given(agencyRepository.save(any(Agency.class))).willReturn(persistedAgency);
//
//        kycService.approveVerification(request, "admin-1");
//
//        ArgumentCaptor<Agency> agencyCaptor = ArgumentCaptor.forClass(Agency.class);
//        then(agencyRepository).should().save(agencyCaptor.capture());
//        Agency savedAgency = agencyCaptor.getValue();
//        assertEquals("Legal Company", savedAgency.getAgencyName());
//        assertEquals("123 Main Street", savedAgency.getAddress());
//        assertEquals("ACTIVE", savedAgency.getStatus());
//        assertEquals(BigDecimal.ZERO, savedAgency.getCreditLimit());
//        assertEquals(BigDecimal.ZERO, savedAgency.getCurrentCredit());
//        assertEquals(BigDecimal.ZERO, savedAgency.getWalletBalance());
//        assertSame(basicRank, savedAgency.getRank());
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        then(userRepository).should().save(userCaptor.capture());
//        assertSame(persistedAgency, userCaptor.getValue().getAgency());
//
//        ArgumentCaptor<SystemLog> systemLogCaptor = ArgumentCaptor.forClass(SystemLog.class);
//        then(systemLogRepository).should().save(systemLogCaptor.capture());
//        assertTrue(systemLogCaptor.getValue().getAction().contains("Duyệt hồ sơ cho agency: 200 - Legal Company"));
//
//        then(notificationService).should().sendNotification(
//                eq("user-20"),
//                eq("KYC"),
//                eq("KYC Verification Approved"),
//                eq("Your KYC verification has been approved."),
//                eq("KYC"),
//                eq("20"),
//                eq("/partner/kyc")
//        );
//    }
//
//    //getdetail
//    @Test
//    void getVerificationDetail_InvalidId_ThrowsKycVerificationNotFound() {
//        given(verificationRepository.findDetailById(999)).willReturn(Optional.empty());
//
//        AppException exception = assertThrows(
//                AppException.class,
//                () -> kycService.getVerificationDetail(999)
//        );
//
//        assertEquals(ErrorCode.KYC_VERIFICATION_NOT_FOUND, exception.getErrorCode());
//        then(kycMapper).shouldHaveNoInteractions();
//        then(s3Service).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void getVerificationDetail_Success_FiltersDeletedDocumentsAndPopulatesFileUrls() {
//        KycDocument activeDoc1 = KycDocument.builder()
//                .id(1)
//                .documentType("BUSINESS_LICENSE")
//                .status("PENDING")
//                .s3ObjectKey("kyc/key-1")
//                .isDeleted(false)
//                .build();
//        KycDocument deletedDoc = KycDocument.builder()
//                .id(2)
//                .documentType("REPRESENTATIVE_CIC")
//                .status("PENDING")
//                .s3ObjectKey("kyc/key-2")
//                .isDeleted(true)
//                .build();
//        KycDocument activeDoc2 = KycDocument.builder()
//                .id(3)
//                .documentType("TAX")
//                .status("APPROVED")
//                .s3ObjectKey("kyc/key-3")
//                .isDeleted(false)
//                .build();
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(77)
//                .documents(List.of(activeDoc1, deletedDoc, activeDoc2))
//                .build();
//        KycVerificationDetailResponse mappedResponse = KycVerificationDetailResponse.builder()
//                .id(77)
//                .status("PENDING")
//                .build();
//
//        given(verificationRepository.findDetailById(77)).willReturn(Optional.of(verification));
//        given(kycMapper.toDetailResponse(verification)).willReturn(mappedResponse);
//        given(s3Service.getFileUrl("kyc/key-1")).willReturn("https://s3/key-1");
//        given(s3Service.getFileUrl("kyc/key-3")).willReturn("https://s3/key-3");
//
//        KycVerificationDetailResponse response = kycService.getVerificationDetail(77);
//
//        assertEquals(2, response.getDocuments().size());
//        assertEquals(1, response.getDocuments().get(0).getId());
//        assertEquals("https://s3/key-1", response.getDocuments().get(0).getFileUrl());
//        assertEquals(3, response.getDocuments().get(1).getId());
//        assertEquals("https://s3/key-3", response.getDocuments().get(1).getFileUrl());
//
//        then(s3Service).should(times(1)).getFileUrl("kyc/key-1");
//        then(s3Service).should(times(1)).getFileUrl("kyc/key-3");
//        then(s3Service).should(never()).getFileUrl("kyc/key-2");
//    }
//
//    @Test
//    void getVerificationDetail_NoDocuments_ReturnsEmptyListInResponse() {
//        // GIVEN
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(88)
//                .documents(List.of())
//                .build();
//        KycVerificationDetailResponse mappedResponse = KycVerificationDetailResponse.builder()
//                .id(88)
//                .build();
//
//        given(verificationRepository.findDetailById(88)).willReturn(Optional.of(verification));
//        given(kycMapper.toDetailResponse(verification)).willReturn(mappedResponse);
//
//        // WHEN
//        KycVerificationDetailResponse response = kycService.getVerificationDetail(88);
//
//        // THEN
//        assertTrue(response.getDocuments().isEmpty());
//        then(s3Service).shouldHaveNoInteractions();
//    }
//
//    @Test
//    void getVerificationDetail_AllDocumentsDeleted_ReturnsEmptyListInResponse() {
//        // GIVEN
//        KycDocument deletedDoc1 = KycDocument.builder()
//                .id(10)
//                .isDeleted(true)
//                .s3ObjectKey("key-10")
//                .build();
//        KycDocument deletedDoc2 = KycDocument.builder()
//                .id(11)
//                .isDeleted(true)
//                .s3ObjectKey("key-11")
//                .build();
//
//        PartnerVerification verification = PartnerVerification.builder()
//                .id(89)
//                .documents(List.of(deletedDoc1, deletedDoc2))
//                .build();
//
//        KycVerificationDetailResponse mappedResponse = KycVerificationDetailResponse.builder()
//                .id(89)
//                .build();
//
//        given(verificationRepository.findDetailById(89)).willReturn(Optional.of(verification));
//        given(kycMapper.toDetailResponse(verification)).willReturn(mappedResponse);
//
//        // WHEN
//        KycVerificationDetailResponse response = kycService.getVerificationDetail(89);
//
//        // THEN
//        assertEquals(0, response.getDocuments().size());
//        then(s3Service).should(never()).getFileUrl(anyString());
//    }
//
//    private ApproveVerificationRequest approveRequest(Integer verificationId, String status, String rejectionReason, Boolean verificationBefore) {
//        return ApproveVerificationRequest.builder()
//                .verificationId(verificationId)
//                .status(status)
//                .rejectionReason(rejectionReason)
//                .verificationBefore(verificationBefore)
//                .build();
//    }
//
//    private PartnerLegalInformation baseLegalInformation() {
//        return PartnerLegalInformation.builder()
//                .legalName("Legal Company")
//                .businessAddress("123 Main Street")
//                .build();
//    }
//
//
//
//}