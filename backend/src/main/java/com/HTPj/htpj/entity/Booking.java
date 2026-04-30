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
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "hotel_id", nullable = false)
    private Integer hotelId;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "nights")
    private Integer nights;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(name = "total_guests")
    private Integer totalGuests;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_total", precision = 12, scale = 2)
    private BigDecimal discountTotal;

    @Column(name = "final_amount", precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(name = "booking_status", length = 50)
    private String bookingStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "guest_name", columnDefinition = "nvarchar(255)")
    private String guestName;

    @Column(name = "guest_phone", length = 20)
    private String guestPhone;

    @Column(name = "guest_email", length = 100)
    private String guestEmail;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "promotion_code")
    private String promotionCode;

    @Column(name = "discount_val", precision = 18, scale = 2)
    private BigDecimal discountVal;

    @Column(name = "type_discount")
    private String typeDiscount;

    @OneToMany(
            mappedBy = "booking",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BookingDetail> bookingDetails;

    @Column(name = "has_feedback")
    private Boolean hasFeedback;

    @Column(name = "cancellation_penalty", precision = 12, scale = 2)
    private BigDecimal cancellationPenalty;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "payout_processed")
    private Boolean payoutProcessed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_booking_id")
    private AgencyBooking agencyBooking;

}