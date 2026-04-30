package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.pdf.UpdatePdfDocumentRequest;
import com.HTPj.htpj.dto.response.pdf.PdfDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PdfDocumentService {

    PdfDocumentResponse uploadPdf(MultipartFile file, String title, String description);

    PdfDocumentResponse getById(Long documentId);

    List<PdfDocumentResponse> getAll();

    PdfDocumentResponse update(Long documentId, UpdatePdfDocumentRequest request);

    void delete(Long documentId);
}
