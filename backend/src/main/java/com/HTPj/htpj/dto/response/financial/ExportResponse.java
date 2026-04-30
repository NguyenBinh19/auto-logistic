package com.HTPj.htpj.dto.response.financial;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExportResponse {
    private String fileName;
    private String contentType;
    private byte[] data;
}
