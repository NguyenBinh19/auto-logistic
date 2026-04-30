package com.HTPj.htpj.dto.response.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ListStaffResponse {

    String id;
    LocalDate dob;
    String firstName;
    String lastName;
    String username;
    String email;
    String phone;
    String address;
    String status;
    String permission;
}

