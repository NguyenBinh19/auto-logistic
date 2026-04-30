package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.pdf.UpdatePdfDocumentRequest;
import com.HTPj.htpj.dto.response.pdf.PdfDocumentResponse;
import com.HTPj.htpj.service.PdfDocumentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/pdf-documents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PdfDocumentController {

    PdfDocumentService pdfDocumentService;

    // Tải lên tài liệu PDF
    @PostMapping
    ApiResponse<PdfDocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description
    ) {
        return ApiResponse.<PdfDocumentResponse>builder()
                .result(pdfDocumentService.uploadPdf(file, title, description))
                .build();
    }

    // Xem chi tiết tài liệu PDF
    @GetMapping("/{documentId}")
    ApiResponse<PdfDocumentResponse> getById(@PathVariable Long documentId) {
        return ApiResponse.<PdfDocumentResponse>builder()
                .result(pdfDocumentService.getById(documentId))
                .build();
    }

    // Danh sách tất cả tài liệu PDF
    @GetMapping
    ApiResponse<List<PdfDocumentResponse>> getAll() {
        return ApiResponse.<List<PdfDocumentResponse>>builder()
                .result(pdfDocumentService.getAll())
                .build();
    }

    // Cập nhật thông tin tài liệu PDF
    @PutMapping("/{documentId}")
    ApiResponse<PdfDocumentResponse> update(
            @PathVariable Long documentId,
            @RequestBody UpdatePdfDocumentRequest request
    ) {
        return ApiResponse.<PdfDocumentResponse>builder()
                .result(pdfDocumentService.update(documentId, request))
                .build();
    }

    // Xóa tài liệu PDF
    @DeleteMapping("/{documentId}")
    ApiResponse<Void> delete(@PathVariable Long documentId) {
        pdfDocumentService.delete(documentId);
        return ApiResponse.<Void>builder()
                .message("Xóa tài liệu PDF thành công")
                .build();
    }
}
