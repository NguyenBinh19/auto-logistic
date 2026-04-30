package com.HTPj.htpj.dto.request.promotions;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckPromotionCodeRequest {
    private Integer hotelId;
//    private Long agencyId;
    private String code;
    private LocalDate checkin;
    private LocalDate checkout;
    private BigDecimal billAmount;
}
