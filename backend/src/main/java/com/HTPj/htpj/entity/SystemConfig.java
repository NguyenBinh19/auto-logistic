package com.HTPj.htpj.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Integer configId;

    @Column(name = "config_code", nullable = false)
    private String configCode;

    @Column(name = "config_value", nullable = false, columnDefinition = "nvarchar(max)")
    private String configValue;

    @Column(name = "data_type", nullable = false)
    private String dataType;

    @Column(name = "config_name", nullable = false)
    private String configName;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}