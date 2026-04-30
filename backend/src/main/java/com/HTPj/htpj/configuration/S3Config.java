package com.HTPj.htpj.configuration;

import com.HTPj.htpj.dto.vault.DbVaultProps;
import com.HTPj.htpj.dto.vault.S3VaultProps;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    private final S3VaultProps props;

    public S3Config(S3VaultProps props) {
        this.props = props;
    }

    @Bean
    public S3Client S3Client() {
        AwsBasicCredentials awsBasicCredentials = AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey());
        return S3Client.builder()
                .region(Region.of(props.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(awsBasicCredentials))
                .build();
    }
}
