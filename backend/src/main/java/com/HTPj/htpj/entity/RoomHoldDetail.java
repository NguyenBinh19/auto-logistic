package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_hold_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomHoldDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hold_id", nullable = false)
    private RoomHold roomHold;

    @Column(name = "room_type_id", nullable = false)
    private Integer roomTypeId;

    @Column(nullable = false)
    private Integer quantity;
}
