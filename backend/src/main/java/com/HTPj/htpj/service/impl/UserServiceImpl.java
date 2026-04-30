package com.HTPj.htpj.service.impl;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.HTPj.htpj.constant.PredefinedRole;
import com.HTPj.htpj.dto.request.BanUserRequest;
import com.HTPj.htpj.dto.request.ProfileUpdateRequest;
import com.HTPj.htpj.dto.request.UserCreationRequest;
import com.HTPj.htpj.dto.request.UserUpdateRequest;
import com.HTPj.htpj.dto.response.UserResponse;
import com.HTPj.htpj.entity.Role;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.UserMapper;
import com.HTPj.htpj.repository.RoleRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.EmailService;
import com.HTPj.htpj.service.S3Service;
import com.HTPj.htpj.service.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    EmailService emailService;
    S3Service s3Service;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public UserResponse createUser(UserCreationRequest request) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Validate role selection
        String selectedRole = request.getRole();
        if (!PredefinedRole.HOTEL_MANAGER_ROLE.equals(selectedRole)
                && !PredefinedRole.AGENCY_MANAGER_ROLE.equals(selectedRole)) {
            throw new AppException(ErrorCode.INVALID_ROLE_SELECTION);
        }

        Users user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setStatus("UNVERIFIED");

        // Assign selected role
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(selectedRole).ifPresent(roles::add);
        user.setRoles(roles);

        // Generate OTP
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setOtpAttempts(0);
        user.setOtpLastSent(LocalDateTime.now());

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), otp, user.getUsername());

        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        return userMapper.toUserResponse(getCurrentUserr());
    }

    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        Users user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        userRepository.deleteById(userId);
    }

    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    @Override
    public UserResponse updateMyProfile(ProfileUpdateRequest request) {
        Users user = getCurrentUserr();

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateMyAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        Users user = getCurrentUserr();

        try {
            // Delete old avatar if exists
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
                String oldKey = extractS3Key(user.getAvatarUrl());
                if (oldKey != null) {
                    s3Service.deleteFile(oldKey);
                }
            }

            // Upload new avatar
            String key = "avatars/" + user.getId() + "/" + UUID.randomUUID() + getFileExtension(file.getOriginalFilename());
            s3Service.uploadFile(file, key);
            String avatarUrl = s3Service.getFileUrl(key);

            user.setAvatarUrl(avatarUrl);
            return userMapper.toUserResponse(userRepository.save(user));
        } catch (IOException e) {
            log.error("Failed to upload avatar", e);
            throw new AppException(ErrorCode.AVATAR_UPLOAD_FAILED);
        }
    }

    @Override
    public UserResponse removeMyAvatar() {
        Users user = getCurrentUserr();

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            String oldKey = extractS3Key(user.getAvatarUrl());
            if (oldKey != null) {
                s3Service.deleteFile(oldKey);
            }
        }

        user.setAvatarUrl(null);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> searchUsers(String keyword, String role, String status, Pageable pageable) {
        return userRepository.searchUsers(keyword, role, status, pageable)
                .map(userMapper::toUserResponse);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse banUser(String userId, BanUserRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Prevent banning admin accounts
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> PredefinedRole.ADMIN_ROLE.equals(role.getName()));
        if (isAdmin) {
            throw new AppException(ErrorCode.CANNOT_BAN_ADMIN);
        }

        if (Boolean.TRUE.equals(request.getBanned())) {
            user.setStatus("BANNED");
        } else {
            user.setStatus("ACTIVE");
        }

        log.info("User {} status changed to {} by admin. Reason: {}",
                userId, user.getStatus(), request.getReason());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMIN_STAFF')")
    public long countActiveUsers() {
        return userRepository.countByStatus("ACTIVE");
    }

    private Users getCurrentUser() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        return userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }


    private Users getCurrentUserr() {
        var context = SecurityContextHolder.getContext();
        var authentication = context.getAuthentication();

        // KIỂM TRA NULL Ở ĐÂY
        if (authentication == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            String userId = jwt.getClaim("userId");

            return userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
    private String extractS3Key(String url) {
        if (url == null) return null;
        int idx = url.indexOf(".amazonaws.com/");
        if (idx >= 0) {
            return url.substring(idx + ".amazonaws.com/".length());
        }
        return null;
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex >= 0 ? filename.substring(dotIndex) : "";
    }

    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    @Override
    public UserResponse selectRoleForCurrentUser(String role) {
        Users user = getCurrentUserr();

        // Only allow role selection if user has no roles (SSO users who haven't chosen yet)
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_ROLE_SELECTION);
        }

        if (!PredefinedRole.HOTEL_MANAGER_ROLE.equals(role)
                && !PredefinedRole.AGENCY_MANAGER_ROLE.equals(role)) {
            throw new AppException(ErrorCode.INVALID_ROLE_SELECTION);
        }

        Role selectedRole = roleRepository.findById(role)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ROLE_SELECTION));

        HashSet<Role> roles = new HashSet<>();
        roles.add(selectedRole);
        user.setRoles(roles);

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
}