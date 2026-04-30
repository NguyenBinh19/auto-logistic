package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.BanUserRequest;
import com.HTPj.htpj.dto.request.ProfileUpdateRequest;
import com.HTPj.htpj.dto.request.UserCreationRequest;
import com.HTPj.htpj.dto.request.UserUpdateRequest;
import com.HTPj.htpj.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserCreationRequest request);

    UserResponse getMyInfo();

    UserResponse updateUser(String userId, UserUpdateRequest request);

    void deleteUser(String userId);

    List<UserResponse> getUsers();

    UserResponse getUser(String id);

    UserResponse updateMyProfile(ProfileUpdateRequest request);

    UserResponse updateMyAvatar(MultipartFile file);

    UserResponse removeMyAvatar();

    Page<UserResponse> searchUsers(String keyword, String role, String status, Pageable pageable);

    UserResponse banUser(String userId, BanUserRequest request);

    long countActiveUsers();

    UserResponse selectRoleForCurrentUser(String role);
}
