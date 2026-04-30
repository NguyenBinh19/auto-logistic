package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "booking_details")
public class BookingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_detail_id")
    private Long bookingDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "room_title", length = 255)
    private String roomTitle;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "price_per_night", precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "subtotal_amount", precision = 12, scale = 2)
    private BigDecimal subtotalAmount;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "nights")
    private Integer nights;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "room_code", length = 50)
    private String roomCode;

    @Column(name = "bed_type", length = 100)
    private String bedType;

    @Column(name = "room_area", precision = 10, scale = 2)
    private BigDecimal roomArea;

    @Column(name = "max_adults")
    private Integer maxAdults;

    @Column(name = "max_children")
    private Integer maxChildren;

    @Column(name = "max_guests")
    private Integer maxGuests;

    @Column(name = "amenities", columnDefinition = "NVARCHAR(MAX)")
    private String amenities;

    @OneToMany(mappedBy = "bookingDetail",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<BookingDetailPrice> prices;
}