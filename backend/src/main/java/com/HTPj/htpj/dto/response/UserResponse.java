package com.HTPj.htpj.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String email;
    String phone;
    String address;
    String avatarUrl;
    String firstName;
    String lastName;
    String status;
    LocalDate dob;
    LocalDateTime lastLogin;
    Set<RoleResponse> roles;
    Long agencyId;
    Integer hotelId;
}