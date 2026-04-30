package com.HTPj.htpj.controller;

import java.util.List;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.PermissionRequest;
import com.HTPj.htpj.dto.response.PermissionResponse;
import com.HTPj.htpj.service.PermissionService;
import com.HTPj.htpj.service.impl.PermissionServiceImpl;
import org.springframework.web.bind.annotation.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionController {
    PermissionService permissionServiceImpl;

    @PostMapping
    ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionServiceImpl.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionServiceImpl.getAll())
                .build();
    }

    @DeleteMapping("/{permission}")
    ApiResponse<Void> delete(@PathVariable String permission) {
        permissionServiceImpl.delete(permission);
        return ApiResponse.<Void>builder().build();
    }
}