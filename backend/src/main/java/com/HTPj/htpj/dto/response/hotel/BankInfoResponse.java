package com.HTPj.htpj.dto.response.hotel;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankInfoResponse {
    String bankName;
    String bankAccountNumber;
    String bankAccountHolder;
}
