package com.msfg.calculator.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("siteName", "MSFG Calculator Suite");
        config.put("theme", "dark");
        config.put("aiEnabled", false);
        config.put("logoUrl", null);
        return config;
    }

    public void updateConfig(Map<String, Object> settings) {
        // Stub - no-op
    }

    public void uploadLogo() {
        // Stub - no-op
    }

    public void configureAI() {
        // Stub - no-op
    }

    public void testAI() {
        // Stub - no-op
    }

    public void clearAIConfig() {
        // Stub - no-op
    }
}
