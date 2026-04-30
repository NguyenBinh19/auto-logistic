package com.HTPj.htpj.entity;
import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room_holds")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hold_code", nullable = false, unique = true)
    private String holdCode;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(nullable = false)
    private String status; // HOLDING | EXPIRED|BOOKED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "roomHold", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomHoldDetail> details;

}

