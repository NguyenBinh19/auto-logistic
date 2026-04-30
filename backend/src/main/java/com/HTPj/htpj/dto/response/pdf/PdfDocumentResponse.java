package com.HTPj.htpj.dto.response.pdf;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfDocumentResponse {

    private Long documentId;
    private String title;
    private String description;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
