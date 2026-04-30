package com.HTPj.htpj.dto.request.addonservice;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAddonServiceRequest {

    private Integer hotelId;
    private String serviceName;
    private String category;
    private String description;
    private BigDecimal netPrice;
    private BigDecimal publicPrice;
    private String unit;
    private String imageUrl;
    private Boolean requireServiceDate;
    private Boolean requireFlightInfo;
    private Boolean requireSpecialNote;
}
