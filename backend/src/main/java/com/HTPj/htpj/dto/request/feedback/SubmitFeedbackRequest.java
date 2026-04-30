package com.HTPj.htpj.dto.request.feedback;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmitFeedbackRequest {
    @NotNull
    Long bookingId;

    @NotNull
    Integer hotelId;

    @NotNull
    @Min(1) @Max(5)
    Integer overall;

    @NotNull
    @Min(1) @Max(5)
    Integer cleanliness;

    @NotNull
    @Min(1) @Max(5)
    Integer service;

    @NotBlank
    @Size(max = 2000)
    String comment;
}
