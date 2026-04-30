package com.HTPj.htpj.dto.response.notification;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountResponse {
    private long unreadCount;
}
