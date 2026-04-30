package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_allotments",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"room_type_id", "allotment_date"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAllotment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allotment_id")
    private Long allotmentId;

    @Column(name = "room_type_id", nullable = false)
    private Integer roomTypeId;

    @Column(name = "allotment_date", nullable = false)
    private LocalDate allotmentDate;

    @Column(name = "allotment", nullable = false)
    private Integer allotment;

    @Column(name = "sold_count")
    private Integer soldCount;

    @Column(name = "stop_sell", nullable = false)
    private Boolean stopSell;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (stopSell == null) stopSell = false;
        if (soldCount == null) soldCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public int getAvailable() {
        return Math.max(0, allotment - (soldCount != null ? soldCount : 0));
    }
}
