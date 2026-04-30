package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.partner.BanPartnerRequest;
import com.HTPj.htpj.dto.request.partner.CreateStaffRequest;
import com.HTPj.htpj.dto.request.partner.UpdateStaffRequest;
import com.HTPj.htpj.dto.response.partner.ListStaffResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.PartnerMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.NotificationService;
import com.HTPj.htpj.service.PartnerService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PartnerServiceImpl implements PartnerService {

    AgencyRepository agencyRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    PartnerBlacklistRepository blacklistRepository;
    PartnerVerificationRepository  partnerVerificationRepository;
    RoleRepository roleRepository;
    EmailService emailService;
    PasswordEncoder passwordEncoder;
    PartnerMapper partnerMapper;
    NotificationService notificationService;

    @Override
    public void banPartner(String partnerType, Long partnerId,BanPartnerRequest request,String adminId) {

        PartnerVerification verification;

        if (partnerType.equalsIgnoreCase("AGENCY")) {

            Agency agency = agencyRepository.findById(partnerId)
                    .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

            agency.setStatus("SUSPENDED");
            agencyRepository.save(agency);

            userRepository.suspendUsersByAgency(partnerId);
            verification = partnerVerificationRepository
                    .findVerifiedByAgencyOrderByVersionDesc(partnerId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_NOT_FOUND));

        }

        else if (partnerType.equalsIgnoreCase("HOTEL")) {

            Integer hotelId = partnerId.intValue();
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

            hotel.setStatus("SUSPENDED");
            hotelRepository.save(hotel);

            userRepository.suspendUsersByHotel(hotelId);

            verification = partnerVerificationRepository
                    .findByHotelOrderByVersionDesc(hotelId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.VERIFICATION_NOT_FOUND));

        }

        else {
            throw new AppException(ErrorCode.INVALID_PARTNER_TYPE);
        }

        PartnerLegalInformation legal = verification.getLegalInformation();

        PartnerBlacklist blacklist = PartnerBlacklist.builder()
                .partnerId(partnerId)
                .partnerType(partnerType)
                .reason(request.getReason())
                .evidence(request.getEvidence())
                .legalName(legal.getLegalName())
                .taxCode(legal.getTaxCode())
                .businessLicenseNumber(legal.getBusinessLicenseNumber())
                .representativeCicNumber(legal.getRepresentativeCICNumber())
                .bannedBy(adminId)
                .createdAt(LocalDateTime.now())
                .build();

        blacklistRepository.save(blacklist);

        List<Users> partnerUsers;
        if (partnerType.equalsIgnoreCase("AGENCY")) {
            partnerUsers = userRepository.findByAgency_AgencyId(partnerId);
        } else {
            partnerUsers = userRepository.findByHotel_HotelId(partnerId.intValue());
        }
        for (Users u : partnerUsers) {
            notificationService.sendNotification(u.getId(), "PARTNER",
                    "Tài khoản đối tác đã bị tạm khóa",
                    "Tài khoản đối tác của bạn đã bị tạm khóa. Lý do: " + request.getReason(),
                    "PARTNER", String.valueOf(partnerId), null);
        }
    }

    private String generateRandomPassword(int length) {

        final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String LOWER = "abcdefghijklmnopqrstuvwxyz";
        final String NUMBER = "0123456789";
        final String SPECIAL = "@#$%!&*";

        final String ALL = UPPER + LOWER + NUMBER + SPECIAL;

        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);

        password.append(UPPER.charAt(random.nextInt(UPPER.length())));
        password.append(LOWER.charAt(random.nextInt(LOWER.length())));
        password.append(NUMBER.charAt(random.nextInt(NUMBER.length())));
        password.append(SPECIAL.charAt(random.nextInt(SPECIAL.length())));

        for (int i = 4; i < length; i++) {
            password.append(ALL.charAt(random.nextInt(ALL.length())));
        }

        return password.toString();
    }

    @Override
    @Transactional
    public String createStaff(CreateStaffRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String managerId = jwt.getClaim("userId");
        String scope = jwt.getClaim("scope");

        Users manager = userRepository.findById(managerId)
                .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NOT_FOUND));

        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USERNAME_EXISTED);

        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTED);

        if (userRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_EXISTED);

        if (request.getPermission() == null)
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);

        Users staff = new Users();

        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());

        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setPhone(request.getPhone());
        staff.setStatus("ACTIVE");

        String rawPassword = generateRandomPassword(8);
        staff.setPassword(passwordEncoder.encode(rawPassword));

//        Role role = roleRepository.findByName(request.getPermission())
//                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
//
//        staff.setRoles(Set.of(role));

        if ("ROLE_HOTEL_MANAGER".equals(scope)) {

            if (request.getPermission() == null)
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);

            Role role = roleRepository.findByName(request.getPermission())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            staff.setRoles(Set.of(role));

            if (manager.getHotel() == null)
                throw new AppException(ErrorCode.HOTEL_NOT_FOUND);

            staff.setHotel(manager.getHotel());

        } else if ("ROLE_AGENCY_MANAGER".equals(scope)) {
            if (request.getPermission() == null)
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);

            Role role = roleRepository.findByName(request.getPermission())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            staff.setRoles(Set.of(role));

            if (manager.getAgency() == null)
                throw new AppException(ErrorCode.AGENCY_NOT_FOUND);

            staff.setAgency(manager.getAgency());
        } else if ("ROLE_ADMIN".equals(scope)) {
            staff.setIsAdmin(true);

            Role adminRole = roleRepository.findByName("ADMIN_STAFF")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            staff.setRoles(Set.of(adminRole));

        } else {
            throw new AppException(ErrorCode.INVALID_MANAGER_ROLE);
        }

        userRepository.save(staff);

        emailService.sendStaffAccountEmail(
                staff.getEmail(),
                staff.getUsername(),
                rawPassword
        );

        return "Created user successfully";
    }

    @Override
    public List<ListStaffResponse> getStaffList() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String managerId = jwt.getClaim("userId");
        String scope = jwt.getClaim("scope");

        Users manager = userRepository.findById(managerId)
                .orElseThrow(() -> new AppException(ErrorCode.MANAGER_NOT_FOUND));

        List<Users> staffList;

        if ("ROLE_HOTEL_MANAGER".equals(scope)) {

            if (manager.getHotel() == null) {
                throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
            }

            staffList = userRepository.findByHotel_HotelId(
                    manager.getHotel().getHotelId()
            );

        } else if ("ROLE_AGENCY_MANAGER".equals(scope)) {

            if (manager.getAgency() == null) {
                throw new AppException(ErrorCode.AGENCY_NOT_FOUND);
            }

            staffList = userRepository.findByAgency_AgencyId(
                    manager.getAgency().getAgencyId()
            );

        } else {
            throw new AppException(ErrorCode.INVALID_MANAGER_ROLE);
        }

        return staffList.stream()
                .map(partnerMapper::toListStaffResponse)
                .toList();
    }

    @Override
    public List<ListStaffResponse> getAdminList() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String scope = jwt.getClaim("scope");

        if (!"ROLE_ADMIN".equals(scope)) {
            throw new AppException(ErrorCode.INVALID_ADMIN_ROLE);
        }

        List<Users> staffList = userRepository.findByIsAdminTrue();

        return staffList.stream()
                .map(partnerMapper::toListStaffResponse)
                .toList();
    }

    @Override
    @Transactional
    public void lockStaff(String userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setStatus("LOCKED");

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unLockStaff(String userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setStatus("ACTIVE");

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateStaff(UpdateStaffRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String scope = jwt.getClaim("scope");

        Users user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus(request.getStatus());

        if ("ROLE_ADMIN".equals(scope)) {
            userRepository.save(user);
            notificationService.sendNotification(request.getUserId(), "PARTNER",
                    "Thông tin tài khoản đã được cập nhật",
                    "Thông tin tài khoản của bạn đã được cập nhật.",
                    "USER", request.getUserId(), null);
            return;
        }

        if (request.getPermission() != null) {

            Role role = roleRepository.findById(request.getPermission())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            Set<Role> roles = new HashSet<>();
            roles.add(role);

            user.setRoles(roles);
        }

        userRepository.save(user);

        notificationService.sendNotification(request.getUserId(), "PARTNER",
                "Thông tin tài khoản đã được cập nhật",
                "Thông tin tài khoản của bạn đã được cập nhật.",
                "USER", request.getUserId(), null);
    }
}