package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.PermissionRequest;
import com.HTPj.htpj.dto.response.PermissionResponse;

import java.util.List;

public interface PermissionService {

    PermissionResponse create(PermissionRequest request);

    List<PermissionResponse> getAll();

    void delete(String permission);
}
