package com.HTPj.htpj.repository;

import java.util.List;
import java.util.Optional;

import com.HTPj.htpj.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<Users, String> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<Users> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    @Query("SELECT u FROM Users u WHERE u.id = :id")
    Optional<Users> findByIdWithRoles(@Param("id") String id);
    Optional<Users> findByUsername(String username);

    @Modifying
    @Query("UPDATE Users u SET u.status='LOCKED' WHERE u.agency.agencyId = :agencyId")
    void suspendUsersByAgency(Long agencyId);

    @Modifying
    @Query("UPDATE Users u SET u.status='LOCKED' WHERE u.hotel.hotelId = :hotelId")
    void suspendUsersByHotel(Integer hotelId);

    Optional<Users> findByResetToken(String resetToken);

    @Query(value = "SELECT DISTINCT u FROM Users u LEFT JOIN u.roles r WHERE " +
            "(:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:role IS NULL OR r.name = :role) " +
            "AND (:status IS NULL OR u.status = :status)",
           countQuery = "SELECT COUNT(DISTINCT u) FROM Users u LEFT JOIN u.roles r WHERE " +
            "(:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:role IS NULL OR r.name = :role) " +
            "AND (:status IS NULL OR u.status = :status)")
    Page<Users> searchUsers(@Param("keyword") String keyword,
                            @Param("role") String role,
                            @Param("status") String status,
                            Pageable pageable);

    long countByStatus(String status);

    List<Users> findByHotel_HotelId(Integer hotelId);

    List<Users> findByAgency_AgencyId(Long agencyId);

    List<Users> findByIsAdminTrue();

    @Query("SELECT u FROM Users u WHERE u.agency IS NOT NULL AND u.agency.status = 'ACTIVE'")
    List<Users> findAllActiveAgencyUsers();

    @Query(value = """
    Select u.id
    From users u
    Join users_roles ur on ur.users_id = u.id
    Where u.hotel_id = :hotelId and ur.roles_name = 'HOTEL_MANAGER'
""", nativeQuery = true)
    String findHotelMangerID(@Param("hotelId") String hotelId);
}