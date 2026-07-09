package com.coop.erp.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseBootstrapper {

    public static void ensureDatabaseExists() {
        String host = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
        String port = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "5432";
        String dbName = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "coop_erp";
        String username = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "postgres";
        String password = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "postgres";

        String url = String.format("jdbc:postgresql://%s:%s/postgres", host, port);

        try (Connection connection = DriverManager.getConnection(url, username, password);
             Statement statement = connection.createStatement()) {

            String checkQuery = String.format("SELECT 1 FROM pg_database WHERE datname = '%s'", dbName);
            try (ResultSet resultSet = statement.executeQuery(checkQuery)) {
                if (!resultSet.next()) {
                    System.out.println("Database " + dbName + " does not exist. Creating...");
                    statement.executeUpdate("CREATE DATABASE " + dbName);
                    System.out.println("Database " + dbName + " created successfully.");
                } else {
                    System.out.println("Database " + dbName + " already exists. Proceeding with application startup.");
                }
            }

        } catch (Exception e) {
            System.err.println("Database " + dbName + " does not exist and the configured user does not have permission to create it, or connection failed.");
            System.err.println("Please create the database manually or use a PostgreSQL user with CREATEDB permission.");
            System.err.println("Error details: " + e.getMessage());
            // Do not fail startup entirely in case the real datasource connection can somehow still succeed (e.g. proxying or different host),
            // but log clearly so the user knows what happened.
        }
    }
}
