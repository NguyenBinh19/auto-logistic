package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.financial.ExportFinancialRequest;
import com.HTPj.htpj.dto.response.financial.ExportResponse;
import com.HTPj.htpj.service.FinancialExportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/financial/export")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FinancialExportController {

    FinancialExportService financialExportService;

    /**
     * UC-084: Export Financial Report (Excel/PDF/CSV)
     * Returns the file as a binary download.
     */
    @PostMapping
    ResponseEntity<byte[]> exportReport(@RequestBody ExportFinancialRequest request) {
        ExportResponse export = financialExportService.exportReport(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + export.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(export.getContentType()))
                .body(export.getData());
    }
}
