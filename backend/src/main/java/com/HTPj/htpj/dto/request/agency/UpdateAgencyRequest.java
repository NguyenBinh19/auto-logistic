package com.HTPj.htpj.dto.request.agency;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAgencyRequest {
    private String agencyName;
    private String email;
    private String hotline;
    private String contactPhone;
}
