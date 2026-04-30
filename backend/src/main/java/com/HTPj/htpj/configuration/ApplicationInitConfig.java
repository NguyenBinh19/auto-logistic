package com.HTPj.htpj.configuration;

import java.util.HashSet;

import com.HTPj.htpj.constant.PredefinedRole;
import com.HTPj.htpj.entity.Role;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.RoleRepository;
import com.HTPj.htpj.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Initializing application.....");
        return args -> {
            // Initialize all roles
            if (roleRepository.findById(PredefinedRole.USER_ROLE).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .description("User role")
                        .build());
            }

            if (roleRepository.findById(PredefinedRole.HOTEL_MANAGER_ROLE).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.HOTEL_MANAGER_ROLE)
                        .description("Hotel Manager role")
                        .build());
            }

            if (roleRepository.findById(PredefinedRole.HOTEL_STAFF_ROLE).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.HOTEL_STAFF_ROLE)
                        .description("Hotel Staff role")
                        .build());
            }

            if (roleRepository.findById(PredefinedRole.AGENCY_MANAGER_ROLE).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.AGENCY_MANAGER_ROLE)
                        .description("Agency Manager role")
                        .build());
            }

            if (roleRepository.findById(PredefinedRole.AGENCY_STAFF_ROLE).isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.AGENCY_STAFF_ROLE)
                        .description("Agency Staff role")
                        .build());
            }

            Role adminRole;
            if (roleRepository.findById(PredefinedRole.ADMIN_ROLE).isEmpty()) {
                adminRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_ROLE)
                        .description("Admin role")
                        .build());
            } else {
                adminRole = roleRepository.findById(PredefinedRole.ADMIN_ROLE).get();
            }

            if (userRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {
                var roles = new HashSet<Role>();
                roles.add(adminRole);

                Users user = Users.builder()
                        .username(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .email("admin@hms.com")
                        .status("ACTIVE")
                        .roles(roles)
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}