package com.msfg.calculator.controller;

import com.msfg.calculator.model.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @PostMapping("/extract")
    public ResponseEntity<ApiResponse<String>> extract() {
        return ResponseEntity.ok(ApiResponse.error("AI extraction not yet configured"));
    }
}
