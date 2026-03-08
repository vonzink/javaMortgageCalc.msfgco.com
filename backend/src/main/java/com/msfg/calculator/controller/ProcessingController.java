package com.msfg.calculator.controller;

import com.msfg.calculator.model.dto.*;
import com.msfg.calculator.service.ProcessingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/processing")
public class ProcessingController {

    private final ProcessingService processingService;

    public ProcessingController(ProcessingService processingService) {
        this.processingService = processingService;
    }

    @GetMapping("/{type}/search")
    public ResponseEntity<ApiResponse<ProcessingSearchResponse>> search(
            @PathVariable String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int limit) {

        ProcessingSearchResponse response = processingService.searchRecords(type, q, status, sort, page, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{type}/{id}")
    public ResponseEntity<ApiResponse<ProcessingRecordDTO>> getRecord(
            @PathVariable String type,
            @PathVariable Long id) {

        ProcessingRecordDTO record = processingService.getRecord(type, id);
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @PostMapping("/{type}")
    public ResponseEntity<ApiResponse<ProcessingRecordDTO>> createRecord(
            @PathVariable String type,
            @Valid @RequestBody CreateProcessingRecordRequest request) {

        ProcessingRecordDTO record = processingService.createRecord(type, request);
        return ResponseEntity.ok(ApiResponse.success(record, "Record created"));
    }

    @PutMapping("/{type}/{id}")
    public ResponseEntity<ApiResponse<ProcessingRecordDTO>> updateRecord(
            @PathVariable String type,
            @PathVariable Long id,
            @RequestBody UpdateProcessingRecordRequest request) {

        ProcessingRecordDTO record = processingService.updateRecord(type, id, request);
        return ResponseEntity.ok(ApiResponse.success(record, "Record updated"));
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRecord(
            @PathVariable String type,
            @PathVariable Long id) {

        processingService.deleteRecord(type, id);
        return ResponseEntity.ok(ApiResponse.success("Record deleted"));
    }
}
