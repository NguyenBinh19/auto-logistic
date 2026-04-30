package com.HTPj.htpj.dto.project;

import java.time.LocalDateTime;

public interface ChatMessageProjection {
    String getSenderId();
    String getReceiverId();
    String getContent();
    LocalDateTime getCreatedAt();
}