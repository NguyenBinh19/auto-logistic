package com.HTPj.htpj.dto.response.promotions;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyPromotionResponse {
    private Integer id;
    private String code;
    private BigDecimal discountVal;
    private String typeDiscount;
    private LocalDate applyEndDate;
    private BigDecimal maxDiscount;
}
