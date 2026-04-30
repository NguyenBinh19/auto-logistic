package com.HTPj.htpj.dto.request.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateStaffRequest {
    String firstName;
    String lastName;
    String username;
    String email;
    String phone;
    String permission;
}