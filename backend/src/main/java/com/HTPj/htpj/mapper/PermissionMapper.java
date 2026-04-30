package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.PermissionRequest;
import com.HTPj.htpj.dto.response.PermissionResponse;
import com.HTPj.htpj.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}