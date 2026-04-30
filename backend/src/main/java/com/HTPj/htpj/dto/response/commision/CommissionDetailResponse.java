package com.HTPj.htpj.dto.response.commision;
import com.HTPj.htpj.entity.Commission;
import com.HTPj.htpj.entity.Hotel;
import lombok.*;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionDetailResponse {
    private Commission commission;
    private List<Hotel> hotels;
}
