package com.HTPj.htpj.dto.request.booking;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinRequest {
    private String bookingCode;
}
