package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.UserCreationRequest;
import com.HTPj.htpj.dto.request.UserUpdateRequest;
import com.HTPj.htpj.dto.response.UserResponse;
import com.HTPj.htpj.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "firstName", ignore = true)
//    @Mapping(target = "lastName", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "googleId", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "otp", ignore = true)
    @Mapping(target = "otpAttempts", ignore = true)
    @Mapping(target = "otpExpiry", ignore = true)
    @Mapping(target = "otpLastSent", ignore = true)
    @Mapping(target = "otpLockedUntil", ignore = true)
    @Mapping(target = "resetToken", ignore = true)
    @Mapping(target = "resetTokenExpiry", ignore = true)
    @Mapping(target = "agency", ignore = true)
    @Mapping(target = "hotel", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "status", ignore = true)
    Users toUser(UserCreationRequest request);

    UserResponse toUserResponse(Users user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "googleId", ignore = true)
    @Mapping(target = "hotel", ignore = true)
    @Mapping(target = "agency", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "otp", ignore = true)
    @Mapping(target = "otpAttempts", ignore = true)
    @Mapping(target = "otpExpiry", ignore = true)
    @Mapping(target = "otpLastSent", ignore = true)
    @Mapping(target = "otpLockedUntil", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "resetToken", ignore = true)
    @Mapping(target = "resetTokenExpiry", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "username", ignore = true)
    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}