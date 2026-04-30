package com.HTPj.htpj.dto.request.feedback;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReplyFeedbackRequest {
    @NotBlank
    @Size(max = 2000)
    String reply;
}
