package com.HTPj.htpj.dto.request.hotel;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankInfoRequest {
    String bankName;
    String bankAccountNumber;
    String bankAccountHolder;
}
