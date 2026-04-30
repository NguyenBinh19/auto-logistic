package com.HTPj.htpj.dto.request.chat;

import lombok.Data;

@Data
public class CallSignalRequest {
    private String type;
    private String fromUserId;
    private String toUserId;
    private Object offer;
    private Object answer;
    private Object candidate;
    private Boolean video;
}