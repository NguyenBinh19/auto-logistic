package com.HTPj.htpj.dto.vault;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("s3")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class S3VaultProps {
    private String accessKey;
    private String secretKey;
    private String region;
    private String bucketName;
}
