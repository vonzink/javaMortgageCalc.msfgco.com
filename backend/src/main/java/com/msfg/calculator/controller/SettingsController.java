package com.msfg.calculator.controller;

import com.msfg.calculator.model.dto.ApiResponse;
import com.msfg.calculator.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings() {
        Map<String, Object> config = settingsService.getConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<String>> updateSettings(@RequestBody Map<String, Object> settings) {
        settingsService.updateConfig(settings);
        return ResponseEntity.ok(ApiResponse.success("Settings updated (stub)"));
    }

    @PostMapping("/logo")
    public ResponseEntity<ApiResponse<String>> uploadLogo() {
        settingsService.uploadLogo();
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded (stub)"));
    }

    @PostMapping("/ai")
    public ResponseEntity<ApiResponse<String>> configureAI() {
        settingsService.configureAI();
        return ResponseEntity.ok(ApiResponse.success("AI configured (stub)"));
    }

    @PostMapping("/ai/test")
    public ResponseEntity<ApiResponse<String>> testAI() {
        settingsService.testAI();
        return ResponseEntity.ok(ApiResponse.success("AI test passed (stub)"));
    }

    @DeleteMapping("/ai")
    public ResponseEntity<ApiResponse<String>> clearAIConfig() {
        settingsService.clearAIConfig();
        return ResponseEntity.ok(ApiResponse.success("AI config cleared (stub)"));
    }
}
