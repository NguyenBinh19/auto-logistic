package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user1_id")
    Users user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    Users user2;

    String bookingId;

    @Column(length = 50)
    String type; // BOOKING | SUPPORT | GENERAL

    @Column(name = "reference_id")
    String referenceId; // bookingId

    LocalDateTime createdAt;

    String room;
    String checkIn;
    String checkOut;
    String hotelName;
}