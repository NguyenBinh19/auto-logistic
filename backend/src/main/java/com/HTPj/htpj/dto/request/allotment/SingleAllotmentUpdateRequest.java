package com.HTPj.htpj.dto.request.allotment;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleAllotmentUpdateRequest {

    private Integer roomTypeId;
    private LocalDate date;
    private Integer allotment;
}
