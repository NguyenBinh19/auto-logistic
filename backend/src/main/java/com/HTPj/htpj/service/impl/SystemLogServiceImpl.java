package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.response.SystemLogResponse;
import com.HTPj.htpj.repository.SystemConfigRepository;
import com.HTPj.htpj.repository.SystemLogRepository;
import com.HTPj.htpj.service.SystemLogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemLogServiceImpl implements SystemLogService {

    SystemLogRepository systemLogRepository;

    @Override
    public List<SystemLogResponse> getAllLogs() {
        return systemLogRepository.findAll().stream()
                .map(log -> SystemLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUserId())
                        .action(log.getAction())
                        .updatedAt(log.getUpdatedAt())
                        .build())
                .toList();
    }
}
