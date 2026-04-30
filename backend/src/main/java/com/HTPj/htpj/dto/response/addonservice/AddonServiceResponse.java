package com.HTPj.htpj.dto.response.addonservice;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddonServiceResponse {

    private Long serviceId;
    private Integer hotelId;
    private String serviceName;
    private String category;
    private String description;
    private BigDecimal netPrice;
    private BigDecimal publicPrice;
    private String unit;
    private String imageUrl;
    private String status;
    private Boolean requireServiceDate;
    private Boolean requireFlightInfo;
    private Boolean requireSpecialNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
