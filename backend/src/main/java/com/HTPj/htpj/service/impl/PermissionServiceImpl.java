package com.HTPj.htpj.service.impl;

import java.util.List;

import com.HTPj.htpj.dto.request.PermissionRequest;
import com.HTPj.htpj.dto.response.PermissionResponse;
import com.HTPj.htpj.entity.Permission;
import com.HTPj.htpj.mapper.PermissionMapper;
import com.HTPj.htpj.repository.PermissionRepository;
import com.HTPj.htpj.service.PermissionService;
import org.springframework.stereotype.Service;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl implements PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll() {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void delete(String permission) {
        permissionRepository.deleteById(permission);
    }
}