package com.HTPj.htpj.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemLogResponse {
    private Long id;
    private String userId;
    private String action;
    private LocalDateTime updatedAt;
}
