package com.HTPj.htpj.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    @Pattern(regexp = "^0[35789][0-9]{8}$", message = "INVALID_PHONE")
    String phone;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    String address;
}
