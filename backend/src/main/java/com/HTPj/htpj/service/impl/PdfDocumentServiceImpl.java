package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.pdf.UpdatePdfDocumentRequest;
import com.HTPj.htpj.dto.response.pdf.PdfDocumentResponse;
import com.HTPj.htpj.entity.PdfDocument;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.PdfDocumentRepository;
import com.HTPj.htpj.service.PdfDocumentService;
import com.HTPj.htpj.service.S3Service;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PdfDocumentServiceImpl implements PdfDocumentService {

    PdfDocumentRepository pdfDocumentRepository;
    S3Service s3Service;

    private String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }

    @Override
    @Transactional
    public PdfDocumentResponse uploadPdf(MultipartFile file, String title, String description) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.PDF_UPLOAD_FAILED);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new AppException(ErrorCode.PDF_INVALID_FILE_TYPE);
        }

        String originalFileName = file.getOriginalFilename();
        String s3Key = "pdf-documents/" + UUID.randomUUID() + "/" + originalFileName;

        try {
            s3Service.uploadFile(file, s3Key);
        } catch (IOException e) {
            throw new AppException(ErrorCode.PDF_UPLOAD_FAILED);
        }

        String fileUrl = s3Service.getFileUrl(s3Key);
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }
        PdfDocument document = PdfDocument.builder()
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .fileName(originalFileName)
                .fileSize(file.getSize())
                .uploadedBy(getUserId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return toResponse(pdfDocumentRepository.save(document));
    }

    @Override
    public PdfDocumentResponse getById(Long documentId) {
        PdfDocument document = pdfDocumentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.PDF_DOCUMENT_NOT_FOUND));
        return toResponse(document);
    }

    @Override
    public List<PdfDocumentResponse> getAll() {
        return pdfDocumentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PdfDocumentResponse update(Long documentId, UpdatePdfDocumentRequest request) {
        PdfDocument document = pdfDocumentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.PDF_DOCUMENT_NOT_FOUND));

        if (request.getTitle() != null) document.setTitle(request.getTitle());
        if (request.getDescription() != null) document.setDescription(request.getDescription());
        document.setUpdatedAt(LocalDateTime.now());

        return toResponse(pdfDocumentRepository.save(document));
    }

    @Override
    @Transactional
    public void delete(Long documentId) {
        PdfDocument document = pdfDocumentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.PDF_DOCUMENT_NOT_FOUND));

        String fileUrl = document.getFileUrl();
        String s3Key = extractS3Key(fileUrl);
        if (s3Key != null) {
            s3Service.deleteFile(s3Key);
        }

        pdfDocumentRepository.delete(document);
    }

    private PdfDocumentResponse toResponse(PdfDocument doc) {
        return PdfDocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .fileUrl(doc.getFileUrl())
                .fileName(doc.getFileName())
                .fileSize(doc.getFileSize())
                .uploadedBy(doc.getUploadedBy())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }

    private String extractS3Key(String fileUrl) {
        if (fileUrl == null) return null;
        String marker = ".amazonaws.com/";
        int idx = fileUrl.indexOf(marker);
        if (idx >= 0) {
            return fileUrl.substring(idx + marker.length());
        }
        return null;
    }
}
