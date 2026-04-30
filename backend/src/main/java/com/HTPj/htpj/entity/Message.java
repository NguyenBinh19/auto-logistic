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
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    Users sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    Users receiver;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String content;

    LocalDateTime createdAt;

    @Builder.Default
    String type = "TEXT"; // TEXT | FILE

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String fileUrl;

    private String fileName;

    @Builder.Default
    Boolean seen = false;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    Conversation conversation;
}