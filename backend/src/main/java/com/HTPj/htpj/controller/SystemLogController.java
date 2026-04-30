package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.response.SystemLogResponse;
import com.HTPj.htpj.service.SystemLogService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/systemlogs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SystemLogController {
    SystemLogService systemLogService;

    @GetMapping
    public ApiResponse<List<SystemLogResponse>> getAllLogs() {
        return ApiResponse.<List<SystemLogResponse>>builder()
                .result(systemLogService.getAllLogs())
                .build();
    }
}
