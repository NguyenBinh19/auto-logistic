package com.HTPj.htpj.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BanUserRequest {
    @NotNull(message = "Ban status is required")
    Boolean banned;

    String reason;
}
