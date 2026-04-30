package com.HTPj.htpj.dto.request.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    String conversationId;
    String userId;
    String name;
    String lastMessage;
    LocalDateTime time;

    String type;
    String referenceId;
    String booking;
    int unreadCount;
    String room;
    String checkIn;
    String checkOut;
    String hotelName;
    String phoneNumber;
    String rank;
}