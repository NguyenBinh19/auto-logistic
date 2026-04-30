package com.HTPj.htpj.dto.request.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateStaffRequest {
    String userId;
    String firstName;
    String lastName;
    String username;
    String email;
    String phone;
    String status;
    String permission;
}
