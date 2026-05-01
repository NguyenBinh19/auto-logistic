package com.HTPj.htpj.configuration;

import javax.sql.DataSource;

import com.HTPj.htpj.dto.vault.DbVaultProps;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class DataSourceConfig {

    private final DbVaultProps props;

    public DataSourceConfig(DbVaultProps props) {
        this.props = props;
    }

    @Bean
    public DataSource dataSource() {
//        String url = String.format(
//            "jdbc:sqlserver://;serverName=%s;databaseName=%s;encrypt=true;trustServerCertificate=true;",
//            props.getIp(), props.getName()
//        );
        String url = "jdbc:sqlserver://localhost:1433;databaseName=hms;encrypt=true;trustServerCertificate=true;";
        String username = "sa";
        String password = "Justin@2025";

        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        ds.setUrl(url);
//        ds.setUsername(props.getUser());
//        ds.setPassword(props.getPassword());
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}