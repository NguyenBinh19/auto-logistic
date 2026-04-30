package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.response.SystemLogResponse;

import java.util.List;

public interface SystemLogService {
    List<SystemLogResponse> getAllLogs();
}
