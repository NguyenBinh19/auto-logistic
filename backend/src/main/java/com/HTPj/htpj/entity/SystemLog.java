package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "system_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "action", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String action;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}