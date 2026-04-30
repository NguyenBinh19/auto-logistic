package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PdfDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PdfDocumentRepository extends JpaRepository<PdfDocument, Long> {

    List<PdfDocument> findByUploadedBy(String uploadedBy);

    List<PdfDocument> findAllByOrderByCreatedAtDesc();
}
