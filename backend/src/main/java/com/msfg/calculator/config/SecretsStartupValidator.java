package com.msfg.calculator.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class SecretsStartupValidator implements ApplicationRunner {

    private final Environment environment;

    public SecretsStartupValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (isTestProfileActive()) {
            return;
        }

        boolean failFast = environment.getProperty("app.security.fail-fast-on-missing-secrets", Boolean.class, true);
        if (!failFast) {
            return;
        }

        requireNonBlank("DB_USER");
        requireNonBlank("DB_PASSWORD");
        requireNonBlank("DB_NAME");
        requireNonBlank("JWT_SECRET");
        requireNonBlank("ENCRYPTION_KEY");

        String jwtSecret = environment.getProperty("JWT_SECRET", "");
        if (jwtSecret.trim().length() < 64) {
            throw new IllegalStateException("JWT_SECRET must be at least 64 characters for HS512");
        }
    }

    private void requireNonBlank(String envVarName) {
        String value = environment.getProperty(envVarName);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(envVarName + " is required and must not be blank");
        }
    }

    private boolean isTestProfileActive() {
        return Arrays.asList(environment.getActiveProfiles()).contains("test");
    }
}

