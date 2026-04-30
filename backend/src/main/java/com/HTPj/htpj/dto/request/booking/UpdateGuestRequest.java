package com.HTPj.htpj.dto.request.booking;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGuestRequest {
    private Long bookingId;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private String notes;
}
