package com.HTPj.htpj.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username",columnDefinition = "VARCHAR(255)")
    String username;

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    String email;
    String password;
    String phone;
    @Column(name = "address", columnDefinition = "NVARCHAR(255)")
    String address;
    @Column(length = 512)
    String avatarUrl;
    LocalDate dob;
    LocalDateTime lastLogin;

    @Builder.Default
    @Column(length = 20)
    String status = "UNVERIFIED"; // UNVERIFIED, ACTIVE, BANNED, LOCKED

    // OTP fields
    String otp;
    LocalDateTime otpExpiry;
    @Builder.Default
    int otpAttempts = 0;
    LocalDateTime otpLockedUntil;
    LocalDateTime otpLastSent;

    // OAuth2 fields
    String googleId;

    // Password reset fields
    String resetToken;
    LocalDateTime resetTokenExpiry;

    @ManyToMany
    Set<Role> roles;

    @ManyToOne
    @JoinColumn(name = "agency_id")
    Agency agency;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    Hotel hotel;

    @Column(name = "is_admin")
    private Boolean isAdmin;
}