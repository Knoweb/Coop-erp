package com.coop.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.coop.erp.config.DatabaseBootstrapper;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        DatabaseBootstrapper.ensureDatabaseExists();
        SpringApplication.run(BackendApplication.class, args);
    }

}


