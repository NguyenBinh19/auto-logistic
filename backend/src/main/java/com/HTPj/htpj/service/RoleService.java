package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.RoleRequest;
import com.HTPj.htpj.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    RoleResponse create(RoleRequest request);

    List<RoleResponse> getAll();

    void delete(String role);
}
