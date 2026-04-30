package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payout_dispute_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayoutDisputeImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "dispute_id", nullable = false)
    private PayoutDispute dispute;

    @Column(name = "s3_key", length = 500, nullable = false)
    private String s3Key;
}