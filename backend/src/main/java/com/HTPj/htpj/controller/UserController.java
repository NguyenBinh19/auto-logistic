package com.HTPj.htpj.controller;

import java.util.List;
import java.util.Map;

import com.HTPj.htpj.dto.request.*;
import com.HTPj.htpj.dto.response.UserResponse;
import com.HTPj.htpj.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserServiceImpl userServiceImpl;

    @PostMapping("/register")
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userServiceImpl.createUser(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userServiceImpl.getUsers())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userServiceImpl.getUser(userId))
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userServiceImpl.getMyInfo())
                .build();
    }

    // UC-015: Update own profile (phone, address)
    @PutMapping("/my-info")
    ApiResponse<UserResponse> updateMyProfile(@RequestBody @Valid ProfileUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Cập nhật hồ sơ thành công!")
                .result(userServiceImpl.updateMyProfile(request))
                .build();
    }

    // UC-015: Upload avatar
    @PostMapping("/my-info/avatar")
    ApiResponse<UserResponse> updateMyAvatar(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<UserResponse>builder()
                .message("Cập nhật ảnh đại diện thành công!")
                .result(userServiceImpl.updateMyAvatar(file))
                .build();
    }

    // UC-015: Remove avatar
    @DeleteMapping("/my-info/avatar")
    ApiResponse<UserResponse> removeMyAvatar() {
        return ApiResponse.<UserResponse>builder()
                .message("Đã xóa ảnh đại diện.")
                .result(userServiceImpl.removeMyAvatar())
                .build();
    }

    // UC-080: Admin search users with pagination
    @GetMapping("/search")
    ApiResponse<Page<UserResponse>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "username") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ApiResponse.<Page<UserResponse>>builder()
                .result(userServiceImpl.searchUsers(keyword, role, status, pageable))
                .build();
    }

    // UC-080: Admin get user count metrics
    @GetMapping("/metrics")
    ApiResponse<Map<String, Long>> getUserMetrics() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("activeUsers", userServiceImpl.countActiveUsers()))
                .build();
    }

    // UC-082: Admin ban/unban user
    @PutMapping("/{userId}/ban")
    ApiResponse<UserResponse> banUser(@PathVariable String userId, @RequestBody @Valid BanUserRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message(Boolean.TRUE.equals(request.getBanned()) ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.")
                .result(userServiceImpl.banUser(userId, request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable String userId) {
        userServiceImpl.deleteUser(userId);
        return ApiResponse.<String>builder().result("User has been deleted").build();
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userServiceImpl.updateUser(userId, request))
                .build();
    }

    // SSO: Select role for users who logged in via Google without a role
    @PostMapping("/select-role")
    ApiResponse<UserResponse> selectRole(@RequestBody java.util.Map<String, String> request) {
        return ApiResponse.<UserResponse>builder()
                .message("Role selected successfully")
                .result(userServiceImpl.selectRoleForCurrentUser(request.get("role")))
                .build();
    }
}