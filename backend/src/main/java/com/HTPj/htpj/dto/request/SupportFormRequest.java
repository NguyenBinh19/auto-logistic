package com.HTPj.htpj.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupportFormRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 200)
    String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email;

    @Size(max = 20)
    String phone;

    @NotBlank(message = "Chủ đề không được để trống")
    @Size(max = 200)
    String subject;

    @NotBlank(message = "Nội dung không được để trống")
    @Size(max = 5000)
    String message;
}
