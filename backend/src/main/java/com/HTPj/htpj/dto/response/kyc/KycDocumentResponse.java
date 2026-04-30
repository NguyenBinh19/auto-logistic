package com.HTPj.htpj.dto.response.kyc;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycDocumentResponse {
    private Integer id;
    private String documentType;
    private String fileUrl;
    private String status;
    private String adminComment;
}
