package com.HTPj.htpj.controller;

import java.util.List;

import com.HTPj.htpj.dto.request.ApiResponse;
import com.HTPj.htpj.dto.request.RoleRequest;
import com.HTPj.htpj.dto.response.RoleResponse;
import com.HTPj.htpj.service.RoleService;
import org.springframework.web.bind.annotation.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    RoleService roleServiceImpl;

    @PostMapping
    ApiResponse<RoleResponse> create(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleServiceImpl.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleServiceImpl.getAll())
                .build();
    }

    @DeleteMapping("/{role}")
    ApiResponse<Void> delete(@PathVariable String role) {
        roleServiceImpl.delete(role);
        return ApiResponse.<Void>builder().build();
    }
}