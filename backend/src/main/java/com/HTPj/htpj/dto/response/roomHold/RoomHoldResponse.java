package com.HTPj.htpj.dto.response.roomHold;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomHoldResponse {
    private String holdCode;
    private LocalDateTime expiredAt;
    private String status;
}
