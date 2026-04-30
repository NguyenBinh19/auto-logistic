package com.HTPj.htpj.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pdf_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "file_url", nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String fileUrl;

    @Column(name = "file_name", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "uploaded_by", length = 255)
    private String uploadedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
