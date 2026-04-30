package com.HTPj.htpj.dto.request.pdf;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePdfDocumentRequest {

    private String title;
    private String description;
}
