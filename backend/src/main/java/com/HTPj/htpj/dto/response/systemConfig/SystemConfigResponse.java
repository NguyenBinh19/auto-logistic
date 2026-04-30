package com.HTPj.htpj.dto.response.systemConfig;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemConfigResponse {
    Integer configId;
    String configCode;
    String configValue;
    String configName;
    String dataType;
    String description;
    LocalDateTime updatedAt;
    String updatedBy;
}
