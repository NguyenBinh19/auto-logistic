package com.HTPj.htpj.dto.request;

import java.time.LocalDate;

import com.HTPj.htpj.validator.DobConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @NotBlank(message = "USERNAME_INVALID")
    @Size(min = 2, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email;

    @NotBlank(message = "Phone number is required")
    String phone;

    @NotBlank(message = "Role selection is required")
    @Pattern(regexp = "HOTEL_MANAGER|AGENCY_MANAGER", message = "Invalid role. Must be HOTEL_MANAGER or AGENCY_MANAGER")
    String role;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;
}