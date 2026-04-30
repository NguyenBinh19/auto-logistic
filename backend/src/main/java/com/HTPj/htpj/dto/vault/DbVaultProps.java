package com.HTPj.htpj.dto.vault;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("db")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DbVaultProps {
    private String user;
    private String password;
    private String ip;
    private String name;
}
