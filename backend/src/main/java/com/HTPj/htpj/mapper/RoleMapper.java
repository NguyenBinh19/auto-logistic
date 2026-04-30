package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.request.RoleRequest;
import com.HTPj.htpj.dto.response.RoleResponse;
import com.HTPj.htpj.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}