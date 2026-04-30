//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
//import com.HTPj.htpj.dto.request.partner.CreateStaffRequest;
//import com.HTPj.htpj.dto.request.partner.UpdateStaffRequest;
//import com.HTPj.htpj.dto.response.partner.ListStaffResponse;
//import com.HTPj.htpj.entity.Agency;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.PartnerBlacklist;
//import com.HTPj.htpj.entity.PartnerLegalInformation;
//import com.HTPj.htpj.entity.PartnerVerification;
//import com.HTPj.htpj.entity.Role;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.PartnerMapper;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.PartnerServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.ArgumentCaptor;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.ArgumentMatchers.isNull;
//import static org.mockito.ArgumentMatchers.argThat;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class PartnerServiceImplTest {
//
//    @Mock
//    private AgencyRepository agencyRepository;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private PartnerBlacklistRepository blacklistRepository;
//
//    @Mock
//    private PartnerVerificationRepository partnerVerificationRepository;
//
//    @Mock
//    private RoleRepository roleRepository;
//
//    @Mock
//    private EmailService emailService;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private PartnerMapper partnerMapper;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @Mock
//    private SecurityContext securityContext;
//
//    @Mock
//    private Authentication authentication;
//
//    @InjectMocks
//    private PartnerServiceImpl partnerService;
//
//    @BeforeEach
//    void setUpSecurityContext() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//    }
//
//    @AfterEach
//    void clearSecurityContext() {
//        SecurityContextHolder.clearContext();
//    }
//
//    //ban partner
//    @Test
//    void banPartnerAgencySuccessBuildsBlacklistAndSendsNotifications() {
//        Long agencyId = 11L;
//        String adminId = "admin-1";
//        BanPartnerRequest request = BanPartnerRequest.builder()
//                .reason("Fraudulent activity")
//                .evidence("Evidence-001")
//                .build();
//
//        Agency agency = Agency.builder()
//                .agencyId(agencyId)
//                .agencyName("Agency A")
//                .status("ACTIVE")
//                .build();
//        when(agencyRepository.findById(agencyId)).thenReturn(Optional.of(agency));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        PartnerLegalInformation legalInformation = PartnerLegalInformation.builder()
//                .legalName("Agency Legal")
//                .taxCode("TAX-001")
//                .businessLicenseNumber("BIZ-001")
//                .representativeCICNumber("CIC-001")
//                .createdAt(LocalDateTime.now())
//                .updatedAt(LocalDateTime.now())
//                .build();
//        PartnerVerification verification = PartnerVerification.builder()
//                .version(3)
//                .legalInformation(legalInformation)
//                .build();
//        when(partnerVerificationRepository.findVerifiedByAgencyOrderByVersionDesc(agencyId))
//                .thenReturn(List.of(verification));
//
//        Users staff = Users.builder().id("staff-1").build();
//        when(userRepository.findByAgency_AgencyId(agencyId)).thenReturn(List.of(staff));
//
//        when(blacklistRepository.save(any(PartnerBlacklist.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        partnerService.banPartner("AGENCY", agencyId, request, adminId);
//
//        verify(userRepository).suspendUsersByAgency(agencyId);
//        verify(userRepository).findByAgency_AgencyId(agencyId);
//
//        ArgumentCaptor<PartnerBlacklist> blacklistCaptor = ArgumentCaptor.forClass(PartnerBlacklist.class);
//        verify(blacklistRepository).save(blacklistCaptor.capture());
//        PartnerBlacklist blacklist = blacklistCaptor.getValue();
//
//        assertThat(blacklist.getPartnerId()).isEqualTo(agencyId);
//        assertThat(blacklist.getPartnerType()).isEqualTo("AGENCY");
//        assertThat(blacklist.getReason()).isEqualTo("Fraudulent activity");
//        assertThat(blacklist.getEvidence()).isEqualTo("Evidence-001");
//        assertThat(blacklist.getLegalName()).isEqualTo("Agency Legal");
//        assertThat(blacklist.getTaxCode()).isEqualTo("TAX-001");
//        assertThat(blacklist.getBusinessLicenseNumber()).isEqualTo("BIZ-001");
//        assertThat(blacklist.getRepresentativeCicNumber()).isEqualTo("CIC-001");
//        assertThat(blacklist.getBannedBy()).isEqualTo(adminId);
//        assertThat(blacklist.getCreatedAt()).isNotNull();
//
//        verify(notificationService).sendNotification(eq("staff-1"), eq("PARTNER"),
//                eq("Tài khoản đối tác đã bị tạm khóa"),
//                argThat(message -> message.contains("Lý do: Fraudulent activity")),
//                eq("PARTNER"), eq(String.valueOf(agencyId)), isNull());
//    }
//
//    @Test
//    void banPartnerHotelSuccessBuildsBlacklistAndSendsNotifications() {
//        Integer hotelId = 21;
//        String adminId = "admin-2";
//        BanPartnerRequest request = BanPartnerRequest.builder()
//                .reason("Policy violation")
//                .evidence("Evidence-002")
//                .build();
//
//        Hotel hotel = Hotel.builder()
//                .hotelId(hotelId)
//                .hotelName("Hotel B")
//                .status("ACTIVE")
//                .build();
//        when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));
//        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        PartnerLegalInformation legalInformation = PartnerLegalInformation.builder()
//                .legalName("Hotel Legal")
//                .taxCode("TAX-002")
//                .businessLicenseNumber("BIZ-002")
//                .representativeCICNumber("CIC-002")
//                .createdAt(LocalDateTime.now())
//                .updatedAt(LocalDateTime.now())
//                .build();
//        PartnerVerification verification = PartnerVerification.builder()
//                .version(4)
//                .legalInformation(legalInformation)
//                .build();
//        when(partnerVerificationRepository.findByHotelOrderByVersionDesc(hotelId))
//                .thenReturn(List.of(verification));
//
//        Users staff = Users.builder().id("staff-2").build();
//        when(userRepository.findByHotel_HotelId(hotelId)).thenReturn(List.of(staff));
//
//        when(blacklistRepository.save(any(PartnerBlacklist.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        partnerService.banPartner("HOTEL", hotelId.longValue(), request, adminId);
//
//        verify(userRepository).suspendUsersByHotel(hotelId);
//        verify(userRepository).findByHotel_HotelId(hotelId);
//
//        ArgumentCaptor<PartnerBlacklist> blacklistCaptor = ArgumentCaptor.forClass(PartnerBlacklist.class);
//        verify(blacklistRepository).save(blacklistCaptor.capture());
//        PartnerBlacklist blacklist = blacklistCaptor.getValue();
//
//        assertThat(blacklist.getPartnerId()).isEqualTo(hotelId.longValue());
//        assertThat(blacklist.getPartnerType()).isEqualTo("HOTEL");
//        assertThat(blacklist.getReason()).isEqualTo("Policy violation");
//        assertThat(blacklist.getEvidence()).isEqualTo("Evidence-002");
//        assertThat(blacklist.getLegalName()).isEqualTo("Hotel Legal");
//        assertThat(blacklist.getTaxCode()).isEqualTo("TAX-002");
//        assertThat(blacklist.getBusinessLicenseNumber()).isEqualTo("BIZ-002");
//        assertThat(blacklist.getRepresentativeCicNumber()).isEqualTo("CIC-002");
//        assertThat(blacklist.getBannedBy()).isEqualTo(adminId);
//        assertThat(blacklist.getCreatedAt()).isNotNull();
//
//        verify(notificationService).sendNotification(eq("staff-2"), eq("PARTNER"),
//                eq("Tài khoản đối tác đã bị tạm khóa"),
//                argThat(message -> message.contains("Lý do: Policy violation")),
//                eq("PARTNER"), eq(String.valueOf(hotelId)), isNull());
//    }
//
//    @Test
//    void banPartnerAgencyNotFoundThrowsAgencyNotFound() {
//        when(agencyRepository.findById(1L)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> partnerService.banPartner("AGENCY", 1L,
//                BanPartnerRequest.builder().reason("x").evidence("y").build(), "admin"))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.AGENCY_NOT_FOUND));
//
//        verify(agencyRepository).findById(1L);
//        verifyNoInteractions(hotelRepository, userRepository, blacklistRepository,
//                partnerVerificationRepository, notificationService);
//    }
//
//    @Test
//    void banPartnerHotelNotFoundThrowsHotelNotFound() {
//        when(hotelRepository.findById(7)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> partnerService.banPartner("HOTEL", 7L,
//                BanPartnerRequest.builder().reason("x").evidence("y").build(), "admin"))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        verify(hotelRepository).findById(7);
//        verifyNoInteractions(agencyRepository, userRepository, blacklistRepository,
//                partnerVerificationRepository, notificationService);
//    }
//
//    @Test
//    void banPartnerVerificationNotFoundThrowsVerificationNotFound() {
//        Long agencyId = 99L;
//        when(agencyRepository.findById(agencyId)).thenReturn(Optional.of(Agency.builder().agencyId(agencyId).build()));
//        when(agencyRepository.save(any(Agency.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(partnerVerificationRepository.findVerifiedByAgencyOrderByVersionDesc(agencyId)).thenReturn(List.of());
//
//        assertThatThrownBy(() -> partnerService.banPartner("AGENCY", agencyId,
//                BanPartnerRequest.builder().reason("x").evidence("y").build(), "admin"))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.VERIFICATION_NOT_FOUND));
//
//        verify(userRepository).suspendUsersByAgency(agencyId);
//        verify(blacklistRepository, never()).save(any());
//        verify(notificationService, never()).sendNotification(any(), any(), any(), any(), any(), any(), any());
//    }
//
//    @Test
//    void banPartnerInvalidPartnerTypeThrowsInvalidPartnerType() {
//        assertThatThrownBy(() -> partnerService.banPartner("UNKNOWN", 1L,
//                BanPartnerRequest.builder().reason("x").evidence("y").build(), "admin"))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_PARTNER_TYPE));
//
//        verifyNoInteractions(agencyRepository, hotelRepository, userRepository,
//                blacklistRepository, partnerVerificationRepository, notificationService);
//    }
//
//    //create staff
//    @Test
//    void createStaffHotelManagerSuccessLinksHotelEncodesPasswordAndSendsEmail() {
//        String managerId = "manager-hotel";
//        Hotel hotel = Hotel.builder().hotelId(5).hotelName("Hotel 5").build();
//        Users manager = Users.builder().id(managerId).hotel(hotel).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff-hotel")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-hotel@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000001")).thenReturn(false);
//
//        Role role = Role.builder().name("HOTEL_STAFF").build();
//        when(roleRepository.findByName("HOTEL_STAFF")).thenReturn(Optional.of(role));
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff-hotel")
//                .email("staff-hotel@mail.com")
//                .phone("0900000001")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        Jwt jwt = buildJwt(managerId, "ROLE_HOTEL_MANAGER");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        String result = partnerService.createStaff(request);
//
//        assertThat(result).isEqualTo("Created user successfully");
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        Users saved = userCaptor.getValue();
//        assertThat(saved.getFirstName()).isEqualTo("First");
//        assertThat(saved.getLastName()).isEqualTo("Last");
//        assertThat(saved.getUsername()).isEqualTo("staff-hotel");
//        assertThat(saved.getEmail()).isEqualTo("staff-hotel@mail.com");
//        assertThat(saved.getPhone()).isEqualTo("0900000001");
//        assertThat(saved.getStatus()).isEqualTo("ACTIVE");
//        assertThat(saved.getHotel()).isSameAs(hotel);
//        assertThat(saved.getAgency()).isNull();
//        assertThat(saved.getIsAdmin()).isNull();
//        assertThat(saved.getRoles()).containsExactly(role);
//
//        ArgumentCaptor<String> rawPasswordCaptor = ArgumentCaptor.forClass(String.class);
//        verify(passwordEncoder).encode(rawPasswordCaptor.capture());
//        assertThat(rawPasswordCaptor.getValue()).hasSize(8);
//        assertThat(saved.getPassword()).isEqualTo("encoded-password");
//
//        verify(emailService).sendStaffAccountEmail(eq("staff-hotel@mail.com"), eq("staff-hotel"),
//                eq(rawPasswordCaptor.getValue()));
//    }
//
//    @Test
//    void createStaffHotelManagerThrowsHotelNotFoundWhenManagerHasNoHotel() {
//        String managerId = "manager-hotel-null";
//        Users manager = Users.builder().id(managerId).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff")).thenReturn(false);
//        when(userRepository.existsByEmail("staff@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000002")).thenReturn(false);
//        when(roleRepository.findByName("HOTEL_STAFF")).thenReturn(Optional.of(Role.builder().name("HOTEL_STAFF").build()));
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//
//        Jwt jwt = buildJwt(managerId, "ROLE_HOTEL_MANAGER");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff")
//                .email("staff@mail.com")
//                .phone("0900000002")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        verify(passwordEncoder).encode(anyString());
//        verify(emailService, never()).sendStaffAccountEmail(anyString(), anyString(), anyString());
//        verify(userRepository, never()).save(any());
//    }
//
//    @Test
//    void createStaffAgencyManagerSuccessLinksAgencyEncodesPasswordAndSendsEmail() {
//        String managerId = "manager-agency";
//        Agency agency = Agency.builder().agencyId(8L).agencyName("Agency 8").build();
//        Users manager = Users.builder().id(managerId).agency(agency).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff-agency")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-agency@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000003")).thenReturn(false);
//
//        Role role = Role.builder().name("AGENCY_STAFF").build();
//        when(roleRepository.findByName("AGENCY_STAFF")).thenReturn(Optional.of(role));
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff-agency")
//                .email("staff-agency@mail.com")
//                .phone("0900000003")
//                .permission("AGENCY_STAFF")
//                .build();
//
//        Jwt jwt = buildJwt(managerId, "ROLE_AGENCY_MANAGER");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        partnerService.createStaff(request);
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        Users saved = userCaptor.getValue();
//        assertThat(saved.getAgency()).isSameAs(agency);
//        assertThat(saved.getHotel()).isNull();
//        assertThat(saved.getRoles()).containsExactly(role);
//
//        ArgumentCaptor<String> rawPasswordCaptor = ArgumentCaptor.forClass(String.class);
//        verify(passwordEncoder).encode(rawPasswordCaptor.capture());
//        verify(emailService).sendStaffAccountEmail(eq("staff-agency@mail.com"), eq("staff-agency"),
//                eq(rawPasswordCaptor.getValue()));
//    }
//
//    @Test
//    void createStaffAgencyManagerThrowsAgencyNotFoundWhenManagerHasNoAgency() {
//        String managerId = "manager-agency-null";
//        Users manager = Users.builder().id(managerId).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff")).thenReturn(false);
//        when(userRepository.existsByEmail("staff@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000004")).thenReturn(false);
//        when(roleRepository.findByName("AGENCY_STAFF")).thenReturn(Optional.of(Role.builder().name("AGENCY_STAFF").build()));
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//
//        Jwt jwt = buildJwt(managerId, "ROLE_AGENCY_MANAGER");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff")
//                .email("staff@mail.com")
//                .phone("0900000004")
//                .permission("AGENCY_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.AGENCY_NOT_FOUND));
//
//        verify(passwordEncoder).encode(anyString());
//        verify(emailService, never()).sendStaffAccountEmail(anyString(), anyString(), anyString());
//        verify(userRepository, never()).save(any());
//    }
//
//    @Test
//    void createStaffAdminSuccessAssignsAdminRoleAndFlag() {
//        String managerId = "admin-manager";
//        Users manager = Users.builder().id(managerId).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff-admin")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-admin@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000005")).thenReturn(false);
//
//        Role adminRole = Role.builder().name("ADMIN_STAFF").build();
//        when(roleRepository.findByName("ADMIN_STAFF")).thenReturn(Optional.of(adminRole));
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff-admin")
//                .email("staff-admin@mail.com")
//                .phone("0900000005")
//                .permission("IGNORED_PERMISSION")
//                .build();
//
//        Jwt jwt = buildJwt(managerId, "ROLE_ADMIN");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        partnerService.createStaff(request);
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        Users saved = userCaptor.getValue();
//        assertThat(saved.getIsAdmin()).isTrue();
//        assertThat(saved.getRoles()).containsExactly(adminRole);
//        assertThat(saved.getHotel()).isNull();
//        assertThat(saved.getAgency()).isNull();
//
//        ArgumentCaptor<String> rawPasswordCaptor = ArgumentCaptor.forClass(String.class);
//        verify(passwordEncoder).encode(rawPasswordCaptor.capture());
//        verify(emailService).sendStaffAccountEmail(eq("staff-admin@mail.com"), eq("staff-admin"),
//                eq(rawPasswordCaptor.getValue()));
//        verify(roleRepository).findByName("ADMIN_STAFF");
//        verify(roleRepository, never()).findByName("IGNORED_PERMISSION");
//    }
//
//    @Test
//    void createStaffAdminThrowsRoleNotFoundWhenAdminRoleMissing() {
//        String managerId = "admin-manager-missing-role";
//        Users manager = Users.builder().id(managerId).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff-admin")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-admin@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000006")).thenReturn(false);
//        when(roleRepository.findByName("ADMIN_STAFF")).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//
//        Jwt jwt = buildJwt(managerId, "ROLE_ADMIN");
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .firstName("First")
//                .lastName("Last")
//                .username("staff-admin")
//                .email("staff-admin@mail.com")
//                .phone("0900000006")
//                .permission("IGNORED_PERMISSION")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROLE_NOT_FOUND));
//
//        verify(passwordEncoder).encode(anyString());
//        verify(userRepository, never()).save(any());
//        verify(emailService, never()).sendStaffAccountEmail(anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void createStaffUsernameExistedThrowsUsernameExisted() {
//        String managerId = "manager-username-exists";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(userRepository.existsByUsername("staff-exists")).thenReturn(true);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-exists")
//                .email("staff@mail.com")
//                .phone("0900000007")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USERNAME_EXISTED));
//
//        verify(passwordEncoder, never()).encode(anyString());
//        verifyNoInteractions(roleRepository, emailService);
//    }
//
//    @Test
//    void createStaffEmailExistedThrowsEmailExisted() {
//        String managerId = "manager-email-exists";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(userRepository.existsByUsername("staff-email")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-email@mail.com")).thenReturn(true);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-email")
//                .email("staff-email@mail.com")
//                .phone("0900000008")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.EMAIL_EXISTED));
//
//        verify(passwordEncoder, never()).encode(anyString());
//        verifyNoInteractions(roleRepository, emailService);
//    }
//
//    @Test
//    void createStaffPhoneExistedThrowsPhoneExisted() {
//        String managerId = "manager-phone-exists";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(userRepository.existsByUsername("staff-phone")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-phone@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0900000009")).thenReturn(true);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-phone")
//                .email("staff-phone@mail.com")
//                .phone("0900000009")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.PHONE_EXISTED));
//
//        verify(passwordEncoder, never()).encode(anyString());
//        verifyNoInteractions(roleRepository, emailService);
//    }
//
//    @Test
//    void createStaffPermissionNullThrowsRoleNotFound() {
//        String managerId = "manager-no-permission";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(userRepository.existsByUsername("staff-null-permission")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-null-permission@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0910000000")).thenReturn(false);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-null-permission")
//                .email("staff-null-permission@mail.com")
//                .phone("0910000000")
//                .permission(null)
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROLE_NOT_FOUND));
//
//        verify(passwordEncoder, never()).encode(anyString());
//        verifyNoInteractions(roleRepository, emailService);
//    }
//
//    @Test
//    void createStaffPartnerRoleMissingThrowsRoleNotFound() {
//        String managerId = "manager-role-missing";
//        Users manager = Users.builder().id(managerId).hotel(Hotel.builder().hotelId(1).build()).build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.existsByUsername("staff-role-missing")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-role-missing@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0910000001")).thenReturn(false);
//        when(roleRepository.findByName("HOTEL_STAFF")).thenReturn(Optional.empty());
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-role-missing")
//                .email("staff-role-missing@mail.com")
//                .phone("0910000001")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROLE_NOT_FOUND));
//
//        verify(passwordEncoder).encode(anyString());
//        verify(userRepository, never()).save(any());
//        verify(emailService, never()).sendStaffAccountEmail(anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void createStaffManagerNotFoundThrowsManagerNotFound() {
//        String managerId = "missing-manager";
//        when(userRepository.findById(managerId)).thenReturn(Optional.empty());
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff")
//                .email("staff@mail.com")
//                .phone("0910000002")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.MANAGER_NOT_FOUND));
//
//        verifyNoInteractions(roleRepository, emailService, passwordEncoder);
//    }
//
//    @Test
//    void createStaffInvalidManagerRoleThrowsInvalidManagerRole() {
//        String managerId = "manager-invalid-role";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(userRepository.existsByUsername("staff-invalid")).thenReturn(false);
//        when(userRepository.existsByEmail("staff-invalid@mail.com")).thenReturn(false);
//        when(userRepository.existsByPhone("0910000003")).thenReturn(false);
//        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_SOMETHING_ELSE"));
//
//        CreateStaffRequest request = CreateStaffRequest.builder()
//                .username("staff-invalid")
//                .email("staff-invalid@mail.com")
//                .phone("0910000003")
//                .permission("HOTEL_STAFF")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.createStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_MANAGER_ROLE));
//
//        verify(passwordEncoder).encode(anyString());
//        verifyNoInteractions(roleRepository, emailService);
//        verify(userRepository, never()).save(any());
//    }
//
//    //get staff list
//    @Test
//    void getStaffListHotelManagerSuccessUsesHotelRepositoryAndMapper() {
//        String managerId = "manager-hotel-list";
//        Hotel hotel = Hotel.builder().hotelId(77).hotelName("Hotel 77").build();
//        Users manager = Users.builder().id(managerId).hotel(hotel).build();
//        Users staff1 = Users.builder().id("s1").username("s1").build();
//        Users staff2 = Users.builder().id("s2").username("s2").build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.findByHotel_HotelId(77)).thenReturn(List.of(staff1, staff2));
//
//        ListStaffResponse response1 = ListStaffResponse.builder().id("s1").username("s1").build();
//        ListStaffResponse response2 = ListStaffResponse.builder().id("s2").username("s2").build();
//        when(partnerMapper.toListStaffResponse(staff1)).thenReturn(response1);
//        when(partnerMapper.toListStaffResponse(staff2)).thenReturn(response2);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        List<ListStaffResponse> result = partnerService.getStaffList();
//
//        assertThat(result).containsExactly(response1, response2);
//        verify(userRepository).findByHotel_HotelId(77);
//        verify(userRepository, never()).findByAgency_AgencyId(any(Long.class));
//        verify(partnerMapper).toListStaffResponse(staff1);
//        verify(partnerMapper).toListStaffResponse(staff2);
//    }
//
//    @Test
//    void getStaffListHotelManagerThrowsHotelNotFoundWhenManagerHasNoHotel() {
//        String managerId = "manager-hotel-no-hotel";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        assertThatThrownBy(() -> partnerService.getStaffList())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        verify(userRepository, never()).findByHotel_HotelId(anyInt());
//        verifyNoInteractions(partnerMapper);
//    }
//
//    @Test
//    void getStaffListAgencyManagerSuccessUsesAgencyRepositoryAndMapper() {
//        String managerId = "manager-agency-list";
//        Agency agency = Agency.builder().agencyId(88L).agencyName("Agency 88").build();
//        Users manager = Users.builder().id(managerId).agency(agency).build();
//        Users staff1 = Users.builder().id("a1").username("a1").build();
//        Users staff2 = Users.builder().id("a2").username("a2").build();
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
//        when(userRepository.findByAgency_AgencyId(88L)).thenReturn(List.of(staff1, staff2));
//
//        ListStaffResponse response1 = ListStaffResponse.builder().id("a1").username("a1").build();
//        ListStaffResponse response2 = ListStaffResponse.builder().id("a2").username("a2").build();
//        when(partnerMapper.toListStaffResponse(staff1)).thenReturn(response1);
//        when(partnerMapper.toListStaffResponse(staff2)).thenReturn(response2);
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_AGENCY_MANAGER"));
//
//        List<ListStaffResponse> result = partnerService.getStaffList();
//
//        assertThat(result).containsExactly(response1, response2);
//        verify(userRepository).findByAgency_AgencyId(88L);
//        verify(userRepository, never()).findByHotel_HotelId(anyInt());
//        verify(partnerMapper).toListStaffResponse(staff1);
//        verify(partnerMapper).toListStaffResponse(staff2);
//    }
//
//    @Test
//    void getStaffListAgencyManagerThrowsAgencyNotFoundWhenManagerHasNoAgency() {
//        String managerId = "manager-agency-no-agency";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_AGENCY_MANAGER"));
//
//        assertThatThrownBy(() -> partnerService.getStaffList())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.AGENCY_NOT_FOUND));
//
//        verify(userRepository, never()).findByAgency_AgencyId(any(Long.class));
//        verifyNoInteractions(partnerMapper);
//    }
//
//    @Test
//    void getStaffListManagerNotFoundThrowsManagerNotFound() {
//        String managerId = "missing-manager-list";
//        when(userRepository.findById(managerId)).thenReturn(Optional.empty());
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_HOTEL_MANAGER"));
//
//        assertThatThrownBy(() -> partnerService.getStaffList())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.MANAGER_NOT_FOUND));
//
//        verifyNoInteractions(partnerMapper);
//        verify(userRepository).findById(managerId);
//    }
//
//    @Test
//    void getStaffListInvalidManagerRoleThrowsInvalidManagerRole() {
//        String managerId = "invalid-role-list";
//        when(userRepository.findById(managerId)).thenReturn(Optional.of(Users.builder().id(managerId).build()));
//        when(authentication.getPrincipal()).thenReturn(buildJwt(managerId, "ROLE_ADMIN"));
//
//        assertThatThrownBy(() -> partnerService.getStaffList())
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_MANAGER_ROLE));
//
//        verifyNoInteractions(partnerMapper);
//    }
//
//    //update staff
//    @Test
//    void updateStaffAdminSuccessSendsNotificationAndKeepsRoles() {
//        String userId = "staff-admin-update";
//        Role existingRole = Role.builder().name("EXISTING_ROLE").build();
//        Users user = Users.builder()
//                .id(userId)
//                .roles(Set.of(existingRole))
//                .build();
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(authentication.getPrincipal()).thenReturn(buildJwt("admin-1", "ROLE_ADMIN"));
//
//        UpdateStaffRequest request = UpdateStaffRequest.builder()
//                .userId(userId)
//                .firstName("Updated")
//                .lastName("User")
//                .username("updated-user")
//                .email("updated@mail.com")
//                .phone("0900000010")
//                .status("ACTIVE")
//                .build();
//
//        partnerService.updateStaff(request);
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        Users saved = userCaptor.getValue();
//        assertThat(saved.getFirstName()).isEqualTo("Updated");
//        assertThat(saved.getLastName()).isEqualTo("User");
//        assertThat(saved.getUsername()).isEqualTo("updated-user");
//        assertThat(saved.getEmail()).isEqualTo("updated@mail.com");
//        assertThat(saved.getPhone()).isEqualTo("0900000010");
//        assertThat(saved.getStatus()).isEqualTo("ACTIVE");
//        assertThat(saved.getRoles()).isEqualTo(Set.of(existingRole));
//
//        verify(notificationService).sendNotification(eq(userId), eq("PARTNER"),
//                eq("Thông tin tài khoản đã được cập nhật"),
//                eq("Thông tin tài khoản của bạn đã được cập nhật."),
//                eq("USER"), eq(userId), isNull());
//        verifyNoInteractions(roleRepository);
//    }
//
//    @Test
//    void updateStaffPartnerRoleWithPermissionAssignsRoleAndSendsNotification() {
//        String userId = "staff-partner-update";
//        Users user = Users.builder().id(userId).build();
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(authentication.getPrincipal()).thenReturn(buildJwt("manager-1", "ROLE_HOTEL_MANAGER"));
//
//        Role role = Role.builder().name("HOTEL_STAFF_NEW").build();
//        when(roleRepository.findById("HOTEL_STAFF_NEW")).thenReturn(Optional.of(role));
//
//        UpdateStaffRequest request = UpdateStaffRequest.builder()
//                .userId(userId)
//                .firstName("Updated")
//                .lastName("User")
//                .username("updated-user")
//                .email("updated@mail.com")
//                .phone("0900000011")
//                .status("LOCKED")
//                .permission("HOTEL_STAFF_NEW")
//                .build();
//
//        partnerService.updateStaff(request);
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        Users saved = userCaptor.getValue();
//        assertThat(saved.getRoles()).containsExactly(role);
//
//        verify(roleRepository).findById("HOTEL_STAFF_NEW");
//        verify(notificationService).sendNotification(eq(userId), eq("PARTNER"),
//                eq("Thông tin tài khoản đã được cập nhật"),
//                eq("Thông tin tài khoản của bạn đã được cập nhật."),
//                eq("USER"), eq(userId), isNull());
//    }
//
//    @Test
//    void updateStaffPartnerWithoutPermissionSavesWithoutRoleChange() {
//        String userId = "staff-no-permission-update";
//        Role existingRole = Role.builder().name("EXISTING_ROLE").build();
//        Users user = Users.builder().id(userId).roles(Set.of(existingRole)).build();
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(authentication.getPrincipal()).thenReturn(buildJwt("manager-2", "ROLE_AGENCY_MANAGER"));
//
//        UpdateStaffRequest request = UpdateStaffRequest.builder()
//                .userId(userId)
//                .firstName("Updated")
//                .lastName("User")
//                .username("updated-user")
//                .email("updated@mail.com")
//                .phone("0900000012")
//                .status("ACTIVE")
//                .permission(null)
//                .build();
//
//        partnerService.updateStaff(request);
//
//        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
//        verify(userRepository).save(userCaptor.capture());
//        assertThat(userCaptor.getValue().getRoles()).isEqualTo(Set.of(existingRole));
//        verifyNoInteractions(roleRepository);
//        verify(notificationService).sendNotification(eq(userId), eq("PARTNER"),
//                eq("Thông tin tài khoản đã được cập nhật"),
//                eq("Thông tin tài khoản của bạn đã được cập nhật."),
//                eq("USER"), eq(userId), isNull());
//    }
//
//    @Test
//    void updateStaffUserNotExistedThrowsUserNotExisted() {
//        String userId = "missing-user-update";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//        when(authentication.getPrincipal()).thenReturn(buildJwt("admin-1", "ROLE_ADMIN"));
//
//        UpdateStaffRequest request = UpdateStaffRequest.builder()
//                .userId(userId)
//                .firstName("Updated")
//                .lastName("User")
//                .username("updated-user")
//                .email("updated@mail.com")
//                .phone("0900000013")
//                .status("ACTIVE")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.updateStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED));
//
//        verifyNoInteractions(roleRepository, notificationService);
//    }
//
//    @Test
//    void updateStaffRoleMissingThrowsRoleNotFound() {
//        String userId = "staff-role-missing-update";
//        when(userRepository.findById(userId)).thenReturn(Optional.of(Users.builder().id(userId).build()));
//        when(authentication.getPrincipal()).thenReturn(buildJwt("manager-3", "ROLE_HOTEL_MANAGER"));
//        when(roleRepository.findById("HOTEL_STAFF_NEW")).thenReturn(Optional.empty());
//
//        UpdateStaffRequest request = UpdateStaffRequest.builder()
//                .userId(userId)
//                .firstName("Updated")
//                .lastName("User")
//                .username("updated-user")
//                .email("updated@mail.com")
//                .phone("0900000014")
//                .status("ACTIVE")
//                .permission("HOTEL_STAFF_NEW")
//                .build();
//
//        assertThatThrownBy(() -> partnerService.updateStaff(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROLE_NOT_FOUND));
//
//        verify(userRepository, never()).save(any());
//        verify(notificationService, never()).sendNotification(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), any());
//    }
//
//    private Jwt buildJwt(String userId, String scope) {
//        return Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .claim("scope", scope)
//                .build();
//    }
//
//}